# addiesam/Ripple-65B-Preview-DFlash2-QVB8R-5e-3

## Resumen

Ripple-65B-Preview-DFlash2-QVB8R-5e-3 es un paquete de pesos cuantizados del modelo borrador (draft model) DFlash2 asociado a Ripple-65B-Preview, desarrollado por Ricursive AI y comprimido por el autor addiesam mediante el esquema QVB8R (QVB8 con codificación entrópica). El modelo base es un drafter de decodificación especulativa: propone varios tokens a la vez condicionándose en estados ocultos intermedios del modelo objetivo Ripple-65B-Preview, lo que acelera la generación sin alterar la distribución final del modelo grande.

La innovación principal de este paquete no es arquitectónica sino de compresión: cada matriz de pesos se empaqueta con un ancho de bits por fila y se verifica tras el empaquetado, garantizando una cota L∞ (tau = 0,005) entre el peso restaurado y el valor bf16 original. Se trata de una compresión certificada, sin datos de calibración, que depende únicamente de los pesos. El resultado ocupa 3,1 GiB en disco con una media de 6,65 bits por peso en los 49 tensores comprimidos.

Es relevante ahora porque demuestra un enfoque de compresión con garantías formales de error, respaldado por dos preprints, aplicado a un componente crítico de latencia en pipelines de inferencia especulativa. No es, sin embargo, un modelo cargable con `transformers`: requiere el motor QVB8 propietario del autor para ejecutarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredera del drafter DFlash2 de Ripple-65B-Preview; transformer presumiblemente, sin confirmar) |
| Parametros totales | 472.320 (dato real de safetensors; corresponde al drafter, no al modelo objetivo de 65B) |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QVB8R (QVB8 con codificación entrópica), tau = 0,005, media de 6,65 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (empaquetado QVB8R, no cargable por `transformers`) |

## Arquitectura y entrenamiento

El objeto comprimido es el drafter DFlash2 de Ripple-65B-Preview, un modelo borrador para decodificación especulativa que propone múltiples tokens por paso condicionado en estados ocultos intermedios del modelo objetivo. El repositorio original contiene los pesos en bf16; este paquete es una versión cuantizada de esos pesos, no un modelo entrenado de nuevo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el drafter original.

La técnica destacable es QVB8R: empaquetado de cada matriz de pesos con un ancho de bits por fila, seguido de una verificación posterior al empaquetado que registra en `manifest.json` el error máximo (`max_err`) entre el valor restaurado y el bf16 original por tensor. Ningún tensor supera tau = 0,005. El proceso no usa datos de calibración: depende solo de los pesos. Los 49 tensores comprimidos promedian 6,65 bits por peso y el paquete ocupa 3,1 GiB. El marco teórico se describe en dos preprints del autor (ver enlaces).

## Capacidades

- Generación de tokens como drafter en decodificación especulativa: propone varios tokens por paso para acelerar el modelo objetivo Ripple-65B-Preview.
- Requiere obligatoriamente el modelo objetivo para generar texto; por sí solo no produce salida completa.
- Condicionamiento en estados ocultos intermedios del modelo objetivo (según la descripción del repo base).
- Compresión con cota de error certificada por tensor (garantía formal L∞).
- No soporta tool calling, function calling ni agentes de forma documentada.
- Capacidades multilingües: no disponibles.
- No se documentan modos de pensamiento, visión ni audio.

## Casos de uso

- Aceleración de inferencia de Ripple-65B-Preview: emparejar este paquete con el motor QVB8 pasando el paquete del modelo objetivo como `MODEL` y este como `DRAFT`, reduciendo el número de pasos de decodificación del modelo grande.
- Despliegue con restricciones de memoria: al ocupar 3,1 GiB y promediar 6,65 bits por peso, encaja en entornos donde el drafter en bf16 sería más costoso en almacenamiento y ancho de banda.
- Investigación en compresión certificada: usar `manifest.json` y los valores `max_err` por tensor para estudiar el compromiso entre tasa de bits y cota de error en un modelo real.
- Validación de pipelines de decodificación especulativa: comparar la tasa de aceptación de tokens del drafter comprimido frente al bf16 para evaluar el impacto de tau = 0,005 en la latencia efectiva.
- Reproducción de los preprints: replicar los experimentos de compresión de pesos descritos en los dos artículos del autor usando este paquete como referencia.
- Integración en motores de inferencia propios: servir como ejemplo de formato de pesos empaquetado (QVB8R) para quien implemente decodificación especulativa con compresión certificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el paquete ocupa 3,1 GiB en disco; la VRAM necesaria para ejecutarlo junto al modelo objetivo no está documentada.
- GPU recomendadas: no disponible. El motor QVB8 no publica en la información disponible una lista de GPUs soportadas.
- Cabe en GPU de consumo: el tamaño del drafter (3,1 GiB) sugiere que sí en GPUs con 8 GB o más, pero el modelo objetivo de 65B condiciona el requisito real del sistema completo.
- Opciones de despliegue: exclusivamente el motor QVB8 (https://github.com/addiesam/qvb8). No es compatible con vLLM, llama.cpp, Ollama ni TGI según la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| Ripple-65B-Preview-DFlash2 (bf16) | no disponible | no disponible | safetensors bf16 | Apache-2.0 | transformers / motor compatible |
| Ripple-65B-Preview-DFlash2-QVB8R-5e-3 | 472.320 (drafter) | no disponible | QVB8R | Apache-2.0 | solo motor QVB8 |
| Ripple-65B-Preview (objetivo) | 65B | no disponible | no disponible | Apache-2.0 | no disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con drafters de otros ecosistemas.

## Limitaciones y advertencias

- No es cargable directamente con `transformers`; requiere el motor QVB8 y su README para el uso correcto.
- No genera texto por sí solo: necesita el modelo objetivo Ripple-65B-Preview.
- La compresión introduce un error acotado de hasta 0,005 por peso; el impacto de ese error en la tasa de aceptación de la decodificación especulativa no está medido en la información disponible.
- El dato de parámetros totales (472.320) corresponde al drafter, no a los 65B del modelo objetivo; no confundir ambos en documentación o despliegue.
- Sin datos sobre sesgos, riesgo de alucinación ni cobertura idiomática.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial; el código del motor QVB8 también es Apache-2.0, pero el autor declara ausencia de garantías (ver disclaimer del README del motor).
- Cero descargas y cero likes en el momento de la consulta: ecosistema de adopción mínimo, sin validación comunitaria.
- El repositorio tiene 3,4 GB, ligeramente por encima de los 3,1 GiB declarados para los pesos, presumiblemente por metadatos y manifiesto.

## Enlaces

- Hugging Face (este paquete): https://huggingface.co/addiesam/Ripple-65B-Preview-DFlash2-QVB8R-5e-3
- Modelo base (drafter bf16): https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Modelo objetivo: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Motor de inferencia QVB8: https://github.com/addiesam/qvb8
- Paper I: https://doi.org/10.5281/zenodo.23815007
- Paper II: https://doi.org/10.5281/zenodo.23816044
