# ericfithian/piano-duet-aria-onnx

## Resumen

Piano Duet Aria ONNX es una conversión a ONNX del modelo Aria, desarrollado originalmente por Louis Bradshaw y colaboradores en EleutherAI, orientado a la generación musical para piano. Esta versión concreta, publicada por el usuario ericfithian, parte del checkpoint de generación `model-gen.safetensors` del repositorio `loubb/aria-medium-base` y lo exporta a formato ONNX con soporte explícito de caché de clave/valor, lo que permite ejecutar la inferencia directamente en el navegador mediante ONNX Runtime Web y WebGPU.

El modelo consta de 16 capas y se distribuye cuantizado en cuatro bits asimétrico con bloques de 64, lo que reduce el peso de los datos externos a unos 469 MB. La conversión preserva el tratamiento de las filas totalmente enmascaradas en la atención mediante comprobaciones de NaN expresadas como autoigualdad y negación lógica, una técnica necesaria para que ONNX Runtime Web mantenga dichas operaciones en la GPU. El grafo se generó con PyTorch 2.14.1, ONNX 1.23.2 y ONNX Runtime 1.30.0.

La relevancia de esta ficha radica en que ejemplifica un patrón de despliegue poco habitual: un modelo musical de tamaño medio ejecutado íntegramente en el cliente, sin servidor, con licencia Apache 2.0. No obstante, la información pública disponible sobre arquitectura interna, datos de entrenamiento y métricas es muy limitada, y este repositorio no incluye una model card completa más allá de las notas de conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 16 capas (detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits asimetrica con bloques de 64 (pesos); grafo ONNX |
| Idiomas soportados | no disponible (modelo orientado a musica, no a texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data`) |

## Arquitectura y entrenamiento

La información disponible confirma que se trata de un transformer de 16 capas exportado a ONNX con entradas y salidas explícitas de caché de clave/valor, lo que habilita generación autoregresiva incremental en el navegador. El checkpoint de origen es `model-gen.safetensors` de `loubb/aria-medium-base`, en la revisión `5a1ef36c5007ee10fbe57d61d96725a7244bd2b2`. No se detallan en la información proporcionada el número de parámetros, la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo etapas de RLHF o DPO.

La innovación técnica destacable de esta conversión es doble. Por un lado, la cuantización a 4 bits asimétrica con bloques de 64 reduce el tamaño del artefacto a aproximadamente 469 MB de datos externos más un grafo de 259 KB. Por otro, la reescritura de las comprobaciones de NaN en la atención como autoigualdad y negación lógica permite que ONNX Runtime Web las mantenga en WebGPU, preservando el comportamiento correcto sobre filas completamente enmascaradas. El proyecto Piano Duet documenta en sus notas de rendimiento una comparación medida de distribuciones enmascaradas, aunque los valores concretos no se recogen en la información disponible.

## Capacidades

- Generación musical para piano, presumiblemente en el contexto de dueto de piano según el nombre del proyecto.
- Generación autoregresiva con caché de clave/valor explícita, adecuada para decodificación token a token.
- Ejecución local en navegador mediante ONNX Runtime Web con aceleración WebGPU.
- Inferencia en cliente sin dependencia de servidor, lo que permite privacidad y despliegue estático.
- No se ha documentado soporte de tool calling, function calling ni razonamiento multi-paso.
- No se ha documentado capacidad multilingüe ni procesamiento de texto, visión o audio.
- No se ha documentado un modo de razonamiento extendido (thinking mode).

## Casos de uso

- Interpretación de duetos de piano en el navegador: el modelo se ejecuta localmente con ONNX Runtime Web y WebGPU, de modo que una aplicación web puede generar la parte de acompañamiento o respuesta sin enviar datos a un servidor, aprovechando el grafo con caché de clave/valor para decodificación incremental.
- Herramientas educativas de armonía y contrapunto: al generar material musical a partir de un contexto dado, el modelo puede emplearse para ilustrar cómo responde una segunda voz a una línea melódica, con la ventaja de que el estudiante ve el resultado al instante en el cliente.
- Prototipado rápido de interfaces musicales: el tamaño reducido del artefacto (unos 469 MB de datos externos) y su formato ONNX permiten integrarlo en demos estáticas alojadas en CDN o en aplicaciones de escritorio basadas en web, sin infraestructura de GPU dedicada.
- Composición asistida sin conexión: al ejecutarse íntegramente en el dispositivo, el modelo resulta adecuado para escenarios con conectividad limitada o requisitos de privacidad, como talleres o instalaciones interactivas.
- Investigación sobre cuantización en el borde: la exportación con cuantización de 4 bits por bloques y la preservación de comprobaciones de NaN en WebGPU constituyen un caso de estudio reproducible para quienes investigan la fidelidad numérica de modelos cuantizados en navegador.
- Evaluación comparativa de decodificación enmascarada: las notas de rendimiento del proyecto describen una comparación de distribuciones enmascaradas, lo que convierte este artefacto en un banco de pruebas para medir el impacto de la cuantización en la distribución de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el artefacto de datos externos ocupa 469.306.260 bytes (aproximadamente 469 MB) en cuantización de 4 bits, a lo que se suma el grafo de 259.238 bytes.
- GPU recomendadas: no disponibles; el destino declarado es WebGPU en el navegador, por lo que se requiere un navegador con soporte de WebGPU y una GPU compatible.
- Compatibilidad con GPU de consumo: plausible en términos de tamaño de artefacto, pero no confirmada en la información disponible.
- Opciones de despliegue: ONNX Runtime Web (WebGPU) es el entorno objetivo; el artefacto también podría cargarse con ONNX Runtime nativo, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Piano Duet Aria ONNX (este) | no disponible (16 capas) | no disponible | ONNX cuantizado 4 bits | Apache 2.0 | Hugging Face |
| Aria (`loubb/aria-medium-base`) | no disponible | no disponible | safetensors | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos de generación musical comparables.

## Limitaciones y advertencias

- La model card no documenta sesgos, pero al ser un modelo generativo musical entrenado sobre datos no descritos, puede reproducir estilos o patrones sobrerrepresentados en su corpus.
- Riesgo de alucinación en sentido musical: generación de pasajes incoherentes o armónicamente inconsistentes fuera de la distribución de entrenamiento; no se han publicado evaluaciones al respecto.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas; el modelo no está orientado a texto.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el archivo `LICENSE` de Aria y los avisos upstream que acompañan al checkpoint liberado.
- El artefacto requiere mantener el archivo de datos externo `model.onnx.data` junto al grafo; su omisión impide la carga.
- La cuantización de 4 bits puede degradar la fidelidad de la distribución de salida respecto al checkpoint original; el proyecto documenta una comparación, pero sus cifras no están en la información disponible.
- El soporte de WebGPU depende del navegador y del hardware del cliente; no se garantiza en todos los entornos.
- No se han publicado métricas de calidad musical ni evaluaciones comparativas en la información disponible.

## Enlaces

- [Hugging Face: ericfithian/piano-duet-aria-onnx](https://huggingface.co/ericfithian/piano-duet-aria-onnx)
- [Checkpoint de origen: loubb/aria-medium-base](https://huggingface.co/loubb/aria-medium-base)
- [Repositorio Aria en GitHub (EleutherAI)](https://github.com/EleutherAI/aria)
- [Paper de Aria (arXiv:2506.23869)](https://arxiv.org/abs/2506.23869)
- [Notas de rendimiento del proyecto Piano Duet](https://piano-duet.vercel.app/docs/how/performance/)
