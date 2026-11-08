# GrimmDev-Glitch/hexanima-packs

## Resumen

HexAnima packs es un repositorio de artefactos de inferencia, no un modelo entrenado desde cero, publicado por el usuario GrimmDev-Glitch. Contiene los ficheros compartidos que el proyecto HexAnima descarga en un telefono con Snapdragon 8 Gen 2 para ejecutar el modelo generativo Anima sobre la NPU Hexagon V73. En concreto, incluye el codificador de texto Qwen3-0.6B compilado como cuatro context binaries QNN HTP para Hexagon V73 con ranuras de 512 tokens, el decodificador de vista previa TAEHV (`taew2_1`) como contexto V73, la tabla de embeddings de tokens de Qwen3 en fp16 y el stub de cabecera del codificador de texto.

El proposito es puramente de despliegue: permitir que la aplicacion HexAnima arranque y ejecute el pipeline de Anima en la NPU del dispositivo sin recompilar los binarios. Los pesos del modelo principal (packs MiaoMiao) no estan aqui, sino en el repositorio `ayanoby/anima-npu-packs`, y se descargan por separado.

La relevancia es acotada: es material de infraestructura para un port movil concreto (Hexagon V73, Snapdragon 8 Gen 2) y con licencia no comercial heredada de Anima. No aporta un modelo nuevo ni resultados de evaluacion propios, y su repo ocupa 1,2 GB. Creado y actualizado el 2026-11-08, sin descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo unico: codificador de texto Qwen3-0.6B compilado a QNN HTP context binaries (Hexagon V73) + decodificador de vista previa TAEHV (`taew2_1`) + tabla de embeddings Qwen3 fp16 |
| Parametros totales | 0,6 mil millones en el codificador de texto Qwen3-0.6B; el resto de pesos del pipeline no estan en este repo |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (ranuras del context binary del codificador de texto) |
| Tipos de cuantizacion | No disponible de forma explicita; los embeddings se distribuyen en fp16; los context binaries QNN HTP usan cuantizacion propia del backend HTP (no detallada en la model card) |
| Idiomas soportados | No disponible (heredados del codificador Qwen3-0.6B, no declarados en la ficha) |
| Licencia | `other`: Qwen3-0.6B y embeddings bajo Apache 2.0; Anima bajo CircleStone Labs Non-Commercial License; TAEHV segun github.com/madebyollin/taehv. Uso no comercial |
| Formato de pesos | Context binaries QNN HTP (V73), tabla de embeddings fp16 y stub de cabecera; no safetensors ni GGUF |

## Arquitectura y entrenamiento

Este repositorio no documenta entrenamiento alguno: son artefactos compilados. El codificador de texto es Qwen3-0.6B, un transformer denso de 0,6 mil millones de parametros, convertido a cuatro context binaries QNN HTP para Hexagon V73 con 512 ranuras de tokens. El decodificador de vista previa es TAEHV (`taew2_1`), tambien compilado como contexto V73, y se anade la tabla de embeddings de tokens en fp16 junto con el stub de cabecera del codificador.

La innovacion tecnica es el empaquetado para NPU movil: los binarios se generan con `tools/build_ctx.sh` y `tools/make_common_pack.sh` del port HexAnima V73, de modo que la aplicacion descarga un paquete comun (`common_v73/`) y ejecuta la inferencia en la Hexagon NPU en lugar de en CPU o GPU. No hay datos sobre tokens de entrenamiento, composicion del dataset ni etapas de RLHF o DPO, porque el entrenamiento corresponde a los modelos originales (Qwen3-0.6B y Anima), no a este repo.

## Capacidades

- Codificacion de texto para el pipeline Anima: convierte prompts en embeddings usando Qwen3-0.6B compilado para Hexagon V73.
- Decodificacion de vista previa: TAEHV genera previews del proceso de generacion de imagen.
- Ejecucion en NPU: los context binaries estan compilados especificamente para Hexagon V73 (Snapdragon 8 Gen 2).
- Ventana de 512 tokens en el codificador de texto, suficiente para prompts cortos.
- No incluye capacidades de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingues, de vision ni de audio en la ficha.
- No es un modelo de chat ni de generacion de texto autonomo: es infraestructura de un pipeline de generacion visual.

## Casos de uso

- Despliegue de Anima en Snapdragon 8 Gen 2: el paquete `common_v73/` permite que la app HexAnima arranque el pipeline en la NPU sin recompilar los binarios QNN.
- Desarrollo y pruebas del port HexAnima: sirve como dependencia fija para validar el flujo de descarga y ejecucion en Hexagon V73.
- Generacion de previews en movil: TAEHV compilado como contexto V73 permite mostrar vistas previas rapidas durante la generacion de imagen.
- Codificacion de prompts en dispositivo: Qwen3-0.6B en la NPU codifica prompts de hasta 512 tokens sin salir del telefono.
- Integracion en aplicaciones Android con QNN: los context binaries se pueden cargar desde el runtime QNN HTP en apps que ya usen el SDK de Qualcomm.
- Reproduccion de entornos de investigacion: permite replicar el pipeline Anima en hardware movil concreto para medir latencia y consumo.
- Empaquetado y distribucion: sirve de referencia para quien quiera construir paquetes comunes similares con `build_ctx.sh` y `make_common_pack.sh`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- NPU objetivo: Hexagon V73, presente en el Snapdragon 8 Gen 2. Los context binaries no son portables a otras versiones de Hexagon sin recompilar.
- VRAM: no aplica; la inferencia se ejecuta en la NPU del SoC, no en GPU dedicada.
- GPU recomendadas: no aplica para este paquete; el diseno es para NPU movil.
- Cabe en consumer GPU: no es su objetivo; esta compilado para el backend QNN HTP.
- Despliegue: runtime QNN de Qualcomm mediante la app HexAnima; no se soportan vLLM, llama.cpp, Ollama ni TGI con estos binarios.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Tamano del repo: 1,2 GB, a descargar en el dispositivo o transferir previamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HexAnima packs (este repo) | 0,6 mil millones (codificador Qwen3-0.6B) | 512 tokens | QNN HTP context binaries V73 | Other (no comercial) | Hugging Face, 0 descargas |
| Qwen3-0.6B original | 0,6 mil millones | No disponible en esta ficha | safetensors | Apache 2.0 | Hugging Face |
| Anima (pesos MiaoMiao) | No disponible | No disponible | Packs NPU en `ayanoby/anima-npu-packs` | CircleStone Labs Non-Commercial | Hugging Face |
| TAEHV original | No disponible | No disponible | Pesos del repo de madebyollin | Segun github.com/madebyollin/taehv | GitHub |

La comparativa es limitada porque este repositorio no es un modelo autonomo sino un conjunto de artefactos de despliegue; los modelos comparables son los componentes originales que empaqueta.

## Limitaciones y advertencias

- No es un modelo entrenado: no debe evaluarse como tal ni usarse para generacion de texto o imagen por si solo.
- Dependencia de hardware estricta: los context binaries estan compilados para Hexagon V73; no funcionan en otras NPU ni en GPU.
- Contexto limitado a 512 tokens en el codificador de texto.
- Licencia no comercial: Anima se distribuye bajo CircleStone Labs Non-Commercial License y TAEHV tambien restringe el uso comercial; el uso en produccion comercial requiere revisar cada componente.
- Los pesos principales no estan en este repo: hay que descargarlos de `ayanoby/anima-npu-packs`, lo que anade una dependencia externa.
- Riesgo de alucinacion y sesgos: no documentados en esta ficha; dependen de los modelos originales (Qwen3-0.6B y Anima).
- Sin descargas ni likes registrados y actualizacion unica el mismo dia de creacion: madurez y soporte inciertos.
- No se declaran idiomas soportados ni pipeline en la ficha de Hugging Face.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/GrimmDev-Glitch/hexanima-packs
- Proyecto HexAnima: https://github.com/ayanoby/hexanima
- Pesos del modelo Anima para NPU: https://huggingface.co/ayanoby/anima-npu-packs
- TAEHV: https://github.com/madebyollin/taehv
