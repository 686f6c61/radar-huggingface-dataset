# axonlabsai/h3-sift

## Resumen

h3-sift es un conjunto de artefactos derivados de MiniMax-H3, un transformer omni (vídeo y audio) desarrollado por MiniMax. El autor del repositorio, axonlabsai, no entrena un modelo nuevo: aplica una descomposición SVD truncada a cada matriz de pesos 2-D del transformer docente y publica cuatro variantes comprimidas del mismo checkpoint. El objetivo declarado es explorar los límites de la compresión en espacio de pesos cuando no es posible ejecutar el modelo docente para hacer destilación supervisada por salidas.

El modelo base es MiniMax-H3 Base FL2VA, un transformer denso de 33,1 B parámetros (19,3 B cargables en inferencia, con 13 B adicionales en ramas AdaLN que no se usan en inferencia) condicionado por Qwen3-VL-32B. h3-sift publica tres niveles de truncamiento SVD anidados (rank 191, 47 y 19) y un códec binario 2:4 estructurado a 0,626 bit por peso. El repositorio ocupa 8,0 GB y se distribuye en formato diffusers.

La relevancia es metodológica y de investigación: el autor documenta de forma explícita y medible que el resultado está "deliberadamente roto", con errores de Frobenius relativos entre 0,887 y 0,994 en matrices reales. No es un modelo para producción, sino un experimento reproducible sobre cuánta información sobrevive a un truncamiento de rango extremo sin calibración ni ajuste posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer omni (vídeo + audio) de flujo único, basado en MiniMax-H3; derivado por truncamiento SVD y cuantización binaria |
| Parametros totales | 33,1 B en el docente; 1,996 B (`tier-2b`), 0,496 B (`tier-500m`), 0,204 B (`tier-200m`); 33,1 B en `q08` (comprimido a 0,626 bit/peso) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | SVD truncado a rank 191/47/19; códec binario 2:4 estructurado con escala fp16 por grupo de 128 (`q08`) |
| Idiomas soportados | No disponible (condicionamiento vía Qwen3-VL-32B; idiomas del pipeline no especificados) |
| Licencia | MiniMax H3 Community License Agreement (excluye algunos territorios; no se relicencian los pesos) |
| Formato de pesos | safetensors en formato diffusers; repo de 8,0 GB |

## Arquitectura y entrenamiento

El modelo docente es un transformer omni de flujo único de 33,1 B parámetros, del cual 19,3 B son cargables en inferencia; los 13 B restantes residen en ramas AdaLN incluidas en el checkpoint pero no necesarias en el forward. La condicionalización proviene de las hidden states de la capa 50 de Qwen3-VL-32B (66,7 GB). El pipeline completo requiere además VAE de vídeo (10,4 GB), VAE de audio, schedulers, tokenizer y processor del repositorio original.

h3-sift no realiza entrenamiento ni destilación por salidas: no hay rollouts ni ajuste fino de reparación. Cada peso 2-D `W [out, in]` se descompone con una SVD truncada a rank 191 en GPU, y los tres niveles son truncamientos exactos de la misma factorización (`W ≈ B·A`, con `A = S·Vᵀ` y `B = U` recortados), por lo que son anidados y mutuamente consistentes. En carga, cada `nn.Linear` se convierte en dos lineales encadenados sin alterar el grafo de módulos ni la firma del pipeline de diffusers. El artefacto `q08` aplica un códec binario 2:4 estructurado: de cada grupo de 4 entradas se conservan 2, con el patrón elegido por fila de salida según energía retenida (3 bits por fila), cada superviviente colapsado a su signo y una escala fp16 por cada 128 pesos. No se aplica blanqueado de activaciones, calibración ni ajuste de curación, precisamente porque el docente no cabe en el hardware disponible (T4 de 16 GB de VRAM, 30 GB de RAM en Kaggle).

## Capacidades

- Generación de vídeo condicionada por texto, heredada del pipeline MiniMax-H3, con calidad severamente degradada según el nivel de truncamiento.
- Generación de audio acoplada al vídeo en el pipeline original (requiere `audio_vae/` y `audio_scheduler/`).
- Carga compatible con `diffusers` mediante `MiniMaxH3Transformer3DModel` y el módulo `h3sift`.
- Empaquetado y decodificación de factores A en PyTorch puro, sin kernels personalizados.
- Condicionamiento por embeddings de texto: la ruta de demostración usa solo la tabla de embeddings de entrada de Qwen3-VL-32B (1,5 GB), con semántica de tokens real pero sin las 50 capas de razonamiento.
- No se documentan tool calling, function calling, capacidades de agente ni modo de razonamiento explícito.

## Casos de uso

- Investigación sobre compresión en espacio de pesos: reproducir el pipeline `h3sift.compress` sobre el checkpoint docente para estudiar la relación entre rango de truncamiento y energía retenida en matrices concretas (`attn.to_q`, `ff.net.2`).
- Estudio de códecs binarios 2:4: analizar el comportamiento de `q08` a 0,626 bit/peso como referencia de cuantización extrema sin calibración.
- Docencia y divulgación: ilustrar con números medidos (relerr de Frobenius, energía retenida) qué ocurre cuando se trunca un DiT a rank 191 de 5376.
- Pruebas de integración de pipelines diffusers en hardware limitado: validar el flujo de carga, monkeypatch de condicionamiento y generación en una T4 con 16 GB de VRAM.
- Benchmarking de metodologías de compresión: comparar truncamiento SVD puro frente a métodos con blanqueado de activaciones (SVD-LLM, ASVD) que requieren el docente en ejecución.
- Reproducibilidad en Kaggle: ejecutar el script de compresión de 12 horas que lee los 14 shards del transformer de 66 GB por HTTP range y escribe los tres niveles en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica métricas de error de reconstrucción de pesos sobre dos matrices reales de `transformer_blocks.0`:

| Artefacto | Rank | `attn.to_q` relerr | Energía retenida | `ff.net.2` relerr | Energía retenida |
|---|---:|---:|---:|---:|---:|
| `tier-200m` | 19 | 0,979 | 4,2 % | 0,994 | 1,2 % |
| `tier-500m` | 47 | 0,960 | 7,9 % | 0,986 | 2,9 % |
| `tier-2b` | 191 | 0,887 | 21,3 % | 0,948 | 10,1 % |

Los ranks son uniformes en las 638 tensores: 5376 para pesos cuadrados, 14336 para la proyección descendente del FFN y 2688 para la entrada AdaLN.

## Requisitos de hardware

- `tier-200m`: 0,41 GB en disco; inferencia viable en cualquier GPU consumer con suficiente VRAM para el VAE de vídeo (10,4 GB) y el resto del pipeline.
- `tier-500m`: 0,99 GB en disco.
- `tier-2b`: 3,99 GB en disco; es el único nivel que "todavía parece movimiento" según el autor.
- `q08`: 2,61 GB en disco para el transformer completo a 0,626 bit/peso.
- Pipeline completo: requiere además VAE de vídeo (10,4 GB), VAE de audio, schedulers, tokenizer y processor del repo MiniMax-H3.
- Condicionamiento completo: Qwen3-VL-32B ocupa 66,7 GB; el autor indica que hace falta un equipo con ~80 GB para cargarlo y eliminar el monkeypatch de embeddings.
- Despliegue: `diffusers` con el módulo `h3sift`; la decodificación de factores A empaquetados funciona en PyTorch puro sin kernels. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Hardware de referencia del autor: una T4 de 16 GB de VRAM y 30 GB de RAM (Kaggle) para la compresión; latencia y throughput no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| h3-sift (`tier-2b`) | 1,996 B (derivado de 33,1 B) | No disponible | Truncamiento SVD rank 191 de MiniMax-H3 | MiniMax H3 Community License | Hugging Face, 8,0 GB |
| MiniMax-H3 (docente) | 33,1 B (19,3 B en inferencia) | No disponible | Transformer omni vídeo+audio original | MiniMax H3 Community License | Hugging Face |
| SVD-LLM / ASVD (métodos) | Depende del modelo base | No aplica | Compresión SVD con blanqueado de activaciones y calibración | Según implementación | Repositorios de investigación |

No se dispone de datos de benchmarks que permitan comparar rendimiento generativo con alternativas de la misma categoría.

## Limitaciones y advertencias

- El propio autor califica el modelo como "deliberadamente, mediblemente roto": los errores de Frobenius relativos oscilan entre 0,887 y 0,994 en las matrices medidas.
- El condicionamiento de la ruta de demostración es débil: usa solo la tabla de embeddings de Qwen3-VL-32B, sin las 50 capas de razonamiento, lo que degrada la fidelidad al prompt.
- No hay calibración, blanqueado de activaciones ni ajuste de curación; los métodos SVD-LLM/ASVD recuperan una fracción de punto precisamente con esas técnicas, que aquí no se aplican.
- Riesgo elevado de alucinación visual y de artefactos: el nivel `tier-200m` se describe como "sopa de texturas con un latido".
- Licencia MiniMax H3 Community License: excluye algunos territorios y no relicencia los pesos; es obligatorio revisarla antes de cualquier uso, incluido el comercial.
- Idiomas soportados no documentados; el pipeline depende del tokenizer y processor de MiniMax-H3.
- No apto para producción: es un artefacto de investigación sobre compresión, no un modelo generativo funcional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/axonlabsai/h3-sift
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia MiniMax H3 Community License Agreement: incluida en el repositorio del modelo base
