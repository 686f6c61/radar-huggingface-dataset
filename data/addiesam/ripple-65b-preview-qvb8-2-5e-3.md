# addiesam/Ripple-65B-Preview-QVB8-2.5e-3

## Resumen

Ripple-65B-Preview-QVB8-2.5e-3 es un paquete de pesos cuantizados del modelo de lenguaje Ripple-65B-Preview, desarrollado originalmente por Ricursive AI y comprimido por el investigador independiente addiesam mediante el formato QVB8. No se trata de un modelo entrenado desde cero, sino de una versión comprimida del modelo base bf16 con una garantía formal de error máximo acotado (L∞-bounded): cada peso restaurado difiere del original en menos que tau = 0.0025.

La propuesta técnica es distintiva: en lugar de optimizar la cuantización según métricas medias como perplejidad, el formato QVB8 controla el error máximo por tensor, almacenando el error observado en `manifest.json`. Esto responde a un problema real de las cuantizaciones agresivas: errores grandes en pesos aislados que producen fallos puntuales difíciles de detectar en promedios. El paquete incluye 642 tensores comprimidos con una media de 5,91 bits por peso.

Un aspecto crítico es que este paquete no es cargable directamente en `transformers` ni en otras herramientas convencionales: requiere el motor de inferencia QVB8 (v1.0.1 o superior), que decodifica los pesos comprimidos en la GPU mediante kernels CUDA propios. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Ripple-65B-Preview; el paquete es una cuantizacion de pesos) |
| Parametros totales | 1.664.080 segun safetensors del repo (nota: el nombre comercial del modelo base indica 65B; el dato de safetensors puede corresponder solo a una parte de los tensores o a un conteo parcial) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QVB8 con tau = 0.0025; 642 tensores comprimidos, media de 5,91 bits por peso; certificado para restauracion a fp16 y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | QVB8 (safetensors como contenedor); no cargable en transformers |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Ripple-65B-Preview en la documentacion proporcionada. El paquete QVB8 no modifica la arquitectura: es una compresion de los pesos del modelo original bf16 de Ricursive AI.

El proceso de compresion emplea un ancho de bits por fila para cada matriz de pesos, sin datos de calibracion (depende unicamente de los pesos). Tras el empaquetado, cada tensor se verifica y se registra el error maximo (`max_err`) en `manifest.json`, garantizando que ningun tensor supera tau = 0.0025. Se incluye `escape_tables.json` para acelerar la decodificacion en ejecuciones fp16. No se documentan detalles sobre datos de entrenamiento, RLHF/DPO ni innovaciones arquitectonicas del modelo base.

## Capacidades

- Generacion de texto y conversacion (pipeline `text-generation`, tag `conversational`).
- Las capacidades especificas del modelo base (razonamiento, codigo, matematicas, vision, tool calling, agentes, multilingue) no estan documentadas en la informacion disponible.
- Modo de decodificacion especulativa mediante un modelo drafter opcional (DFlash2), disponible como paquete separado.
- Compresion con garantia de error maximo acotado por peso, verificable en `manifest.json`.

## Casos de uso

- Despliegue de un modelo de 65B en hardware con VRAM limitada: el paquete reduce el tamano a 48,1 GB, lo que permite ejecutar el modelo en GPUs de 48 GB o 80 GB segun configuracion, usando el motor QVB8.
- Investigacion en cuantizacion: el formato L∞-bounded permite estudiar el efecto del error maximo por peso en la calidad de salida, comparando distintos valores de tau (1e-3, 2e-3, 2.5e-3) con tamanos de 57, 49 y 48 GB.
- Evaluacion de robustez de cuantizaciones: util para contrastar la hipotesis de que errores maximos acotados reducen fallos puntuales (palabras erroneas, caracteres de otro idioma) frente a formatos optimizados por media.
- Generacion de texto conversacional en entornos de investigacion donde se prioriza la fidelidad de pesos sobre la velocidad de carga en herramientas estandar.
- Decodificacion especulativa con el drafter DFlash2 (4,2 GB en QVB8, 3,3 GB en QVB8R) para acelerar la inferencia en produccion.
- Reproducibilidad cientifica: los papers asociados y el `manifest.json` con `max_err` por tensor permiten auditar el proceso de compresion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el paquete ocupa 48,1 GB en disco; la VRAM necesaria para inferencia depende del motor QVB8 y del espacio para cache KV y activaciones, no especificado en la documentacion.
- GPU recomendadas: no disponibles de forma explicita; por tamano, encaja en GPUs de 48 GB (A6000, L40S) y 80 GB (A100, H100).
- GPU de consumo: no cabe en GPUs consumer tipicas (RTX 4090 con 24 GB) segun el tamano del paquete.
- Despliegue: exclusivamente mediante el motor QVB8 (v1.0.1 o superior); no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Carga en transformers |
|---|---|---|---|---|---|
| Ripple-65B-Preview-QVB8-2.5e-3 | 65B (nominal) | no disponible | QVB8 | Apache-2.0 | No |
| Ripple-65B-Preview (bf16) | 65B | no disponible | safetensors bf16 | Apache-2.0 | Si |
| Ripple-65B-Preview-QVB8-1e-3 | 65B | no disponible | QVB8 (57 GB) | Apache-2.0 | No |
| Ripple-65B-Preview-QVB8R-2e-3 | 65B | no disponible | QVB8R (38 GB) | Apache-2.0 | No |

No se dispone de datos de rendimiento para comparar con alternativas de otros autores.

## Limitaciones y advertencias

- El paquete no se carga en `transformers` ni en motores estandar; requiere el motor QVB8 y sus kernels CUDA, lo que limita la portabilidad.
- La garantia L∞ cubre unicamente los pesos almacenados, no la calidad ni la correccion de las respuestas del modelo.
- No hay datos publicados sobre sesgos, alucinacion, rendimiento multilingue ni contexto del modelo base.
- El conteo de parametros de safetensors (1.664.080) no concuerda con el nombre comercial "65B"; conviene verificar el contenido real del repo antes de usarlo en produccion.
- El modelo base es una "Preview": puede tener calidad inferior a versiones estables.
- El autor es un investigador independiente; el soporte y mantenimiento del motor no estan garantizados por una organizacion.
- Licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar los terminos de Ricursive AI.

## Enlaces

- Hugging Face: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-2.5e-3
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Motor QVB8: https://github.com/addiesam/qvb8
- Release del motor v1.0.1: https://github.com/addiesam/qvb8/releases/tag/v1.0.1
- Paper I: https://doi.org/10.5281/zenodo.23815007
- Paper II: https://doi.org/10.5281/zenodo.23816044
- Patrocinio: https://github.com/sponsors/addiesam
- Paquete QVB8 1e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-1e-3
- Paquete QVB8R 1e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-1e-3
- Paquete QVB8 2e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8-2e-3
- Paquete QVB8R 2e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-QVB8R-2e-3
- Drafter DFlash2 QVB8 5e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-DFlash2-QVB8-5e-3
- Drafter DFlash2 QVB8R 5e-3: https://huggingface.co/addiesam/Ripple-65B-Preview-DFlash2-QVB8R-5e-3
