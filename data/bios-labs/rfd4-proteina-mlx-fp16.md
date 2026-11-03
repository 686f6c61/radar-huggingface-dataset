# bios-labs/RFD4-Proteina-MLX-fp16

## Resumen

RFD4-Proteina-MLX-fp16 es una implementación en MLX/Metal del tronco transformer recurrente del modelo RFD4-Proteina de NVIDIA, orientada a diseño de proteínas y binders sobre Apple Silicon. El modelo original es un sistema de flow matching para generación de estructuras proteicas; este port comunitario, mantenido por BIOS Labs, reimplementa la parte que consume aproximadamente el 96 % del tiempo de generación y la integra en el sampler upstream sin modificarlo, añadiendo un pipeline local de preparación de dianas, generación, filtros geométricos, co-folding con Boltz-2 en GPU de Apple, ranking y clustering.

El objetivo es ejecutar diseño de binders proteicos íntegramente en un MacBook, sin CUDA ni nube. Según la model card, el port genera 20 binders de 80 aminoácidos contra el dominio extracelular de GLP-1R en aproximadamente 6 minutos 55 segundos en un M5 Pro, lo que supone una mejora de 2,2× frente a PyTorch-MPS en bf16-mixed y de 3,2× frente a fp32. El pipeline completo, desde PDB crudo hasta diseños rankeados y agrupados por diversidad, se completa en unos 12 minutos.

La relevancia actual radica en que acerca herramientas de diseño computacional de proteínas, tradicionalmente ligadas a clústeres con GPU NVIDIA, a hardware de consumo Apple. No obstante, se trata de un port no oficial, no revisado ni respaldado por el Baker Lab ni por NVIDIA, y todos los resultados son in silico: no hay validación experimental en laboratorio húmedo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer recurrente con flow matching (tronco reimplementado en MLX/Metal); pipeline con Boltz-2 para co-folding |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (no aplica: modelo de estructura, no de texto) |
| Tipos de cuantización | fp16 (variante del repo); el upstream soporta bf16-mixed y fp32 según la model card |
| Idiomas soportados | en (inglés) |
| Licencia | BSD-3-Clause |
| Formato de pesos | MLX (repo de 0,4 GB); checkpoint upstream en formato propio de RFD4-Proteina |

## Arquitectura y entrenamiento

El modelo subyacente, nvidia/RFD4-Proteina, es un sistema de diseño de proteínas basado en flow matching que genera estructuras tridimensionales condicionadas por una diana. Este repositorio no reentrena ni modifica los pesos: reimplementa en MLX el tronco transformer recurrente del generador y lo conecta al sampler original sin alteraciones. La innovación técnica del port es un kernel Metal escrito a mano para operaciones tensoriales, que se activa cuando la arquitectura de GPU es `applegpu_g17` o superior (clase M5) y supera un autotest de arranque; en caso contrario se usan las GEMM propias de MLX.

El pipeline añade etapas locales: preparación de la diana (descarga opcional desde RCSB/AFDB), generación de diseños, filtros geométricos baratos, co-folding con Boltz-2 sobre MPS, y ranking con clustering de diversidad. La model card documenta 43 tests funcionales de una sola muestra que cubren monómeros, interacciones proteína-proteína, motivos, enzimas, ligandos, DNA/RNA, inverse folding, difusión parcial, beam search y LoRA, sin fallbacks al tronco de PyTorch en las ejecuciones exitosas. También se reporta un resultado negativo: omitir las actualizaciones de pares en los reciclados destruía los diseños, por lo que ese atajo se descartó. No se dispone de detalles sobre el dataset de entrenamiento original (número de tokens, composición, RLHF/DPO) en la información proporcionada.

## Capacidades

- Diseño de binders proteicos condicionado por estructura diana, con generación de secuencias y estructuras.
- Co-folding y cribado in silico de los diseños mediante Boltz-2 ejecutado en la GPU de Apple.
- Filtros geométricos y ranking automático de candidatos, con clustering de diversidad para exportar un conjunto representativo.
- Soporte de múltiples modalidades de diseño según los tests funcionales: monómeros, PPI, motivos, enzimas, ligandos, DNA/RNA.
- Inverse folding y difusión parcial.
- Beam search durante la generación.
- Ajuste fino con LoRA.
- Ejecución totalmente offline tras las descargas iniciales (se puede forzar con `HF_HUB_OFFLINE=1`).
- Preparación de dianas desde PDB local o descarga desde RCSB/AFDB con `--fetch`.
- No dispone de tool calling, agentes ni capacidades conversacionales: no es un modelo de lenguaje.

## Casos de uso

- Diseño de binders contra dianas terapéuticas: partiendo de la estructura del dominio extracelular de GLP-1R, el pipeline genera 20 diseños de 80 aminoácidos y los criba con Boltz-2 en unos 12 minutos en un M5 Pro, lo que permite iterar rápidamente sobre hipótesis de unión.
- Prototipado académico sin acceso a clúster: investigadores con un Mac de 16 GB o más pueden ejecutar generación y co-folding localmente, sin CUDA ni cuentas cloud, tras una configuración inicial de 30-45 minutos.
- Cribado de motivos funcionales: los tests de motivos y enzimas indican que el tronco soporta condicionamiento por motivos, útil para injertar sitios activos o epítopos en andamios proteicos.
- Diseño de interacciones proteína-proteína (PPI): la cobertura de tests de PPI permite explorar interfaces binarias y evaluar su plausibilidad geométrica antes de cualquier validación experimental.
- Inverse folding: dado un esqueleto estructural, generar secuencias compatibles, útil en pipelines de rediseño de proteínas existentes.
- Ajuste fino con LoRA sobre subconjuntos pequeños: para adaptar el generador a familias de dianas concretas en hardware local, aprovechando el soporte documentado de LoRA.
- Docencia y formación: el repositorio incluye datos crudos, resultados negativos y procedencia de cada métrica, lo que lo hace adecuado para enseñar metodología de evaluación en diseño computacional de proteínas.

## Benchmarks y rendimiento

Los datos disponibles son tiempos de ejecución medidos por el autor, no métricas de calidad de diseño frente a referencias externas.

| Métrica | Resultado | Condiciones |
|---|---|---|
| Generación de 20 binders (80 aa, GLP-1R ECD) | ≈ 6 min 55 s | M5 Pro, MLX/Metal |
| Aceleración vs PyTorch-MPS bf16-mixed | 2,2× (IC 95 %: 1,8-2,7) | Misma máquina |
| Aceleración vs PyTorch-MPS fp32 | 3,2× (IC 95 %: 2,9-3,6) | Misma máquina |
| Pipeline completo (PDB crudo → 20 diseños → co-folding → ranking) | 12 min 04 s | Una ejecución; 377 s generación + 339 s co-folding de 18 diseños; 13 pasaron el cribado in silico, 10 exportados |
| Huella de memoria en generación | ≈ 6,5 GB pico (N = 180) | Más ≈ 5 GB para Boltz-2, ejecutados secuencialmente |
| Tests funcionales | 43 tests de una muestra | Sin fallbacks al tronco PyTorch en ejecuciones exitosas |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo. Las tasas de éxito biológico no están medidas: "13 passed" es un cribado in silico, no una tasa de unión.

## Requisitos de hardware

- VRAM/memoria unificada: 16 GB o más recomendados; pico medido de ≈ 6,5 GB durante generación y ≈ 5 GB adicionales para Boltz-2. Macs de 8 GB no probados.
- GPU: Apple Silicon. El kernel Metal optimizado solo se activa en `applegpu_g17` o superior (clase M5); en M1-M4 se usan las GEMM de MLX y la aceleración frente a PyTorch-MPS no está medida.
- Sistema operativo: macOS 14+ para MLX; todas las mediciones se hicieron en macOS 26.4.1.
- Disco: ≈ 9 GB en instalación limpia (entorno Python 1,8 GB, Boltz-2 5,2 GB, caché de Hugging Face 1,6 GB, repo 0,36 GB).
- Despliegue: paquete Python `rfd4-mlx` sobre MLX; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este modelo). Se recomienda `uv` para el entorno y `hf download` para los pesos.
- Latencia y throughput: 20 diseños en 377 s de generación en M5 Pro; una ejecución separada midió 6 min 59 s de wall-clock incluyendo arranque, atribuido a variabilidad térmica.
- Red: necesaria solo en la configuración inicial; después puede operarse offline.

## Comparativa con modelos similares

| Modelo | Tipo | Ejecución | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RFD4-Proteina-MLX-fp16 | Port MLX del tronco RFD4 + pipeline Boltz-2 | Apple Silicon (MLX/Metal) | BSD-3-Clause | Hugging Face (bios-labs) | Aceleración 2,2× vs PyTorch-MPS en M5 Pro |
| nvidia/RFD4-Proteina | Modelo original | CUDA/PyTorch | no disponible en la información proporcionada | Hugging Face (nvidia) | Referencia upstream; resultados de laboratorio húmedo del preprint |
| PyTorch-MPS (stock) | Implementación de referencia en Apple | Apple Silicon (MPS) | no aplica | No es un modelo distribuido | Base de comparación de rendimiento en la model card |

No se dispone de datos sobre otros modelos de diseño de proteínas comparables (por ejemplo, familias de diffusion o flow matching alternativas) en la información proporcionada.

## Limitaciones y advertencias

- Port no oficial: no está afiliado, revisado ni respaldado por el Baker Lab / Institute for Protein Design (UW) ni por NVIDIA.
- Sin validación experimental: todo es in silico; ningún diseño ha sido probado en laboratorio húmedo. Los resultados de wet lab del preprint pertenecen a la implementación CUDA original.
- Cobertura de hardware limitada: mediciones solo en M5 Pro con macOS 26.4.1; M1-M4 sin aceleración medida y Macs de 8 GB no probados.
- El kernel Metal depende de la arquitectura de GPU y de un autotest; si falla, se degrada silenciosamente a GEMM de MLX.
- Riesgo de artefactos en los diseños: la model card documenta que ciertos atajos (omitir actualizaciones de pares en reciclados) destruyen los diseños, lo que sugiere sensibilidad del sampler a modificaciones.
- Idiomas: solo inglés en la documentación y metadatos; no es un modelo lingüístico.
- Licencia BSD-3-Clause: permite uso comercial con atribución, pero debe verificarse la licencia del checkpoint upstream y de Boltz-2 por separado, ya que no se detallan en la información disponible.
- Configuración inicial costosa: 30-45 minutos y ≈ 9 GB de disco, dependiente del ancho de banda; el backend Xet de Hugging Face rindió a ≈ 3 KB/s en las pruebas del autor, por lo que se recomienda `HF_HUB_DISABLE_XET=1`.
- Los tiempos reportados provienen de ejecuciones únicas o limitadas, con variabilidad térmica reconocida por el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bios-labs/RFD4-Proteina-MLX-fp16
- Modelo base: https://huggingface.co/nvidia/RFD4-Proteina
- Documentación del pipeline de binders: `BINDER_PIPELINE.md` (en el repo)
- Tests funcionales: `FEATURES.md` (en el repo)
- Benchmarks y procedencia de datos: `BENCHMARKS.md` y carpeta `benchmarks/` (en el repo)
- Preprint: `paper/preprint.pdf` (en el repo)
- Datos RCSB PDB: https://www.rcsb.org
- AlphaFold DB: https://alphafold.ebi.ac.uk
- uv (gestor de entornos): https://docs.astral.sh/uv/
