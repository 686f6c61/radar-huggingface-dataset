# ramithuh/rfdiffusion-webgpu

## Resumen

RFdiffusion es un modelo de difusión para el diseño de proteínas desarrollado por el laboratorio Baker (Institute for Protein Design, Universidad de Washington) y RosettaCommons. Este repositorio concreto, `ramithuh/rfdiffusion-webgpu`, no es un modelo nuevo ni un fine-tuning: es un port del checkpoint oficial `Base_ckpt.pt` a un módulo ES (JavaScript) que ejecuta el denoiser aprendido y un sampler reverso SE(3) directamente en el navegador, sin Python, DGL ni e3nn en tiempo de ejecución.

El modelo original es una red de difusión sobre marcos rígidos (frames) de residuos, con atención equivariante SE(3) y representaciones de pares y MSA, que genera estructuras proteicas novedosas a partir de ruido. El port incluye los pesos en tres precisiones (FP32, FP16, INT8) en formato safetensors propio (`rfdiffusion-safetensors-v1`) y kernels WGSL que decodifican los pesos empaquetados y acumulan en F32.

La relevancia de este artefacto es de ingeniería: demuestra que un modelo de difusión estructural de ~60 M de parámetros puede ejecutarse en un navegador con WebGPU, con verificación bit a bit contra el modelo original en PyTorch/DGL. No es un modelo de lenguaje ni un modelo generativo de texto, por lo que las secciones de capacidades lingüísticas, tool calling o benchmarks de NLP no aplican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denoiser de difusión SE(3) con atención equivariante, actualizaciones de pares y MSA, y refinador de estructura compartido; 4 bloques extra-MSA, 32 bloques principales, 4 aplicaciones del refinador |
| Parametros totales | 59.808.046 (state dict de inferencia, 5.998 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre grafos de residuos, no sobre secuencias de texto) |
| Tipos de cuantizacion | FP32, FP16, INT8 (simétrica por fila de salida, con escala F32 colocada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors propietario `rfdiffusion-safetensors-v1` (manifests con longitudes de shard y SHA-256); checkpoint original `Base_ckpt.pt` |

## Arquitectura y entrenamiento

El modelo es un denoiser de difusión sobre marcos rígidos de residuos proteicos. La arquitectura fijada (commit `86507b6538f51fce57b5a72477165f03999ed7ae`) usa atención axial atada en lugar de los bloques de multiplicación triangular de AlphaFold. Las actualizaciones MSA-a-par usan producto externo. Los bloques SE(3) emplean escalares de grado 0 y vectores de grado 1, con armónicos esféricos hasta grado 2 y coeficientes de Clebsch-Gordan de e3nn exportados. La primera convolución se fusiona por grado de entrada y la última por grado de salida; la atención equivariante reduce aristas entrantes en su destino; la normalización de grupo opera sobre normas de características por grado; y las actualizaciones de marcos por cuaterniones siguen el orden de operaciones del upstream.

Dimensiones internas: MSA 256, extra-MSA 64, par 128, template 64, estado de grafo completo 8 y estado de refinamiento 64. Desglose de parámetros por módulo: `simulator` 59.420.900, `templ_emb` 302.144, `latent_emb` 33.536, `recycle` 22.016, `c6d_pred` 16.770, `aa_pred` 5.397, `lddt_pred` 3.250, `full_emb` 3.072, `exp_pred` 961. En inferencia se cargan `model_state_dict`; `c6d_pred` y `exp_pred` se exportan pero se omiten en `return_infer`.

El checkpoint oficial pesa 483.616.107 bytes con SHA-256 `0fcf7d7c32b4848030aca3a051e6768de194616f96ba6c38186351a33bfc6eca`. No se documenta en la información disponible el volumen de tokens, la composición del dataset ni si hubo RLHF/DPO (no aplica a este tipo de modelo). La innovación técnica del repositorio es el port a WebGPU: embeddings categóricos, biases, normas y parámetros radiales/fibra SE(3) se mantienen en F32; el resto de matrices lineales 2D usan el almacenamiento seleccionado; el navegador preserva el empaquetado F16/I8 en GPU y decodifica en WGSL acumulando en F32.

## Capacidades

- Generación de estructuras proteicas novedosas mediante muestreo reverso de difusión SE(3) a partir de ruido.
- Predicción de logits de aminoácido (21 clases) y de lDDT (50 bins) como cabezas auxiliares.
- Condicionamiento por estructura template (bloques axiales de par sesgados por estructura, proyecciones de torsión, atención template par/estado).
- Reciclado de estado (MSA, par y estado) con distancias Cβ inferidas.
- Ejecución en navegador con WebGPU: kernels WGSL para decodificación de pesos empaquetados y acumulación F32.
- No soporta tool calling, function calling ni agentes multi-paso.
- No tiene capacidades multilingües ni de visión, audio o texto.
- No dispone de thinking mode ni razonamiento simbólico.

## Casos de uso

- Diseño de proteínas de novo en el navegador: un investigador puede cargar el módulo ES y ejecutar el sampler reverso sin instalar Python, DGL ni e3nn, útil para demos y entornos con restricciones de instalación.
- Validación de ports y kernels: los fixtures en `fixtures/` permiten comparar cada precisión contra los mismos pesos dequantizados ejecutados en PyTorch/DGL, con error de cuantización reportado por separado; sirve como banco de pruebas para implementaciones WebGPU de modelos científicos.
- Enseñanza y divulgación: al ejecutarse en el navegador con pesos y manifiestos verificables, permite mostrar el pipeline de difusión estructural en un aula sin infraestructura de GPU dedicada.
- Integración en herramientas web de bioinformática: el módulo ES puede embeberse en aplicaciones que necesiten generar candidatos estructurales ligeros sin backend Python.
- Auditoría de reproducibilidad: el bootstrap (`bash tools/bootstrap.sh`) fija el upstream, verifica el checkpoint por SHA-256 y regenera fixtures, lo que facilita la replicación de resultados.
- Investigación sobre cuantización de modelos científicos: los tres bundles (FP32 240.013.816 bytes, FP16 125.190.104 bytes, INT8 69.060.952 bytes) permiten estudiar el impacto de la cuantización en coordenadas finales mediante `tools/verify_roundtrip.py`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de round-trip de exportación en `fixtures/export_metrics.json` y el error de cuantización frente al modelo sin cuantizar, sin cifras concretas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el bundle INT8 ocupa 69.060.952 bytes en disco y el FP32 240.013.816 bytes, por lo que la huella en GPU es del orden de cientos de MB, no de GB.
- GPU recomendadas: el harness usa NVIDIA GB10 con Vulkan/ANGLE nativo y Chromium ARM64; no se documentan otras GPU.
- Cabe en GPU consumer: presumiblemente sí por tamaño, pero no se confirma en la información disponible.
- Despliegue: navegador con WebGPU (Chromium ARM64 en `CHROME_PATH`, por defecto `/home/ruh/.cache/ms-playwright/chromium-1243/chrome-linux-arm64/chrome`); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles. El harness reintenta hasta cinco veces un proceso nativo nuevo solo ante fallos de arranque de Vulkan; cada navegador usa su propia caché de disco NVIDIA/Chromium porque una caché compartida provocó fallos de inicialización de Vulkan.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RFdiffusion (este port) | 59.808.046 | no aplica | Difusión estructural de proteínas | no disponible | Hugging Face, repo de 0,2 GB |
| RFdiffusion original (RosettaCommons) | mismo checkpoint | no aplica | Difusión estructural de proteínas | no disponible | GitHub upstream, checkpoint IPD |
| AlphaFold2 | no disponible en esta ficha | no aplica | Predicción de estructura | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre alternativas en la información proporcionada.

## Limitaciones y advertencias

- El estado de validación se registra en `fixtures/`; una comprobación individual de kernel o denoiser no constituye un pase de release. `npm test` falla si falta cualquier fixture, peso, adaptador de hardware, comparación de coordenadas o contrato de navegador.
- El harness exige hardware real: adaptadores software, identidades de adaptador no reveladas y hardware ausente fallan; no se permiten saltos de test.
- Los reintentos solo cubren fallos de arranque de Vulkan; errores numéricos, de shader o artefactos ausentes fallan sin reintento.
- La licencia no está declarada, lo que impide evaluar el uso comercial.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y las secciones de sesgos lingüísticos o alucinación de texto no aplican.
- El port depende de WebGPU y de un navegador Chromium concreto; la portabilidad a otros navegadores o GPU no está documentada.
- No se realiza subida a Hugging Face de los pesos exportados; `weights/`, `.cache/`, `.venv/` y `node_modules/` están en gitignore, por lo que el repo de 0,2 GB no contiene necesariamente los bundles completos.
- El bootstrap requiere acceso a red para descargar dependencias.

## Enlaces

- Hugging Face: https://huggingface.co/ramithuh/rfdiffusion-webgpu
- Upstream RFdiffusion (commit fijado): https://github.com/RosettaCommons/RFdiffusion/tree/86507b6538f51fce57b5a72477165f03999ed7ae
- Checkpoint oficial IPD: https://files.ipd.uw.edu/pub/RFdiffusion/6f5902ac237024bdd0c176cb93063dc4/Base_ckpt.pt
- RosettaCommons RFdiffusion: https://github.com/RosettaCommons/RFdiffusion
