# AkadashiOmiso/yokiKana-weights

## Resumen

yokiKana-weights es el repositorio de pesos del motor de conversión kana-kanji del IME japonés yokiKana para Windows. No se trata de un modelo único, sino de un paquete de artefactos heterogéneos que el IME descarga en tiempo de instalación: dos modelos de lenguaje de caracteres (charLM) propios del motor Shonagon, tres redes convolucionales en ONNX para el mismo motor, el modelo neuronal de conversión Zenzai (zenz-v3.2-small en GGUF Q5_K_M) y dos LLM de la familia Sarashina 2.2 (1B y 3B) cuantizados a Q8_0 para la función de detección de erratas denominada Chunagon.

El interés del repositorio es doble. Por un lado, documenta una arquitectura de IME moderno que combina un motor clásico de conversión (Shonagon con charLM y CNN) con un corrector neuronal basado en LLM, un patrón cada vez más habitual en la entrada de texto japonesa. Por otro, separa explícitamente los pesos del instalador distribuible: el zip de [yokiKana-releases](https://github.com/AkadashiOmiso/yokiKana-releases) no contiene los binarios, sino un `weights.json` con rutas, tamaños y hashes SHA256, y los pesos se obtienen de este repositorio.

El conjunto suma 1.407.538.944 parámetros según los safetensors declarados y ocupa 6,0 GB en el repositorio. La licencia es mixta: los artefactos propios de Shonagon se rigen por la licencia del proyecto yokiKana, Zenzai es Apache-2.0 y los modelos Sarashina son MIT. El soporte es exclusivamente japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto heterogéneo: charLM (Shonagon), CNN en ONNX (Shonagon), transformer neuronal para conversión kana-kanji (Zenzai zenz-v3.2-small) y LLM transformer (Sarashina 2.2 1B y 3B) |
| Parametros totales | 1.407.538.944 (según safetensors del repositorio) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M (zenz.gguf), Q8_0 (sarashina2.2-3b y 1b), binarios propios sin cuantización declarada, ONNX con embeddings |
| Idiomas soportados | japonés (ja) |
| Licencia | mixta: artefactos Shonagon bajo la licencia de yokiKana; Zenzai Apache-2.0; Sarashina 2.2 MIT |
| Formato de pesos | binarios propios (.bin), ONNX + embeddings, GGUF |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado de forma monolítica, sino varios componentes con orígenes distintos. La carpeta `shonagon/` aloja el motor de conversión propio: dos modelos de lenguaje de caracteres (`charlm5-full-m5-c.bin` y `charlm7-modern-m5-c.bin`), uno orientado a registro literario y otro a japonés moderno, junto con tres CNN (`cnn6`, `cnn10a`, `cnn10h`) exportadas a ONNX con sus embeddings. Según la model card, estos artefactos se entrenaron específicamente para yokiKana.

La carpeta `zenz/` incorpora `zenz.gguf`, correspondiente a zenz-v3.2-small en cuantización Q5_K_M, procedente de [Miwa-Keita/zenz-v3.2-small-gguf](https://huggingface.co/Miwa-Keita/zenz-v3.2-small-gguf), el modelo neuronal de conversión kana-kanji de AzooKey/Zenzai. La carpeta `chunagon/` contiene `sarashina2.2-3b-Q8_0.gguf` y `sarashina2.2-1b-Q8_0.gguf`, versiones cuantizadas con llama.cpp de los modelos [sbintuitions/sarashina2.2-3b](https://huggingface.co/sbintuitions/sarashina2.2-3b) y [sbintuitions/sarashina2.2-1b](https://huggingface.co/sbintuitions/sarashina2.2-1b), empleados para la función de detección de erratas.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO en ninguno de los componentes. Tampoco se detallan innovaciones de decodificación específicas más allá del uso de cuantización GGUF para integrar los modelos en el IME.

## Capacidades

- Conversión kana-kanji para entrada de texto japonés mediante el motor Shonagon, con modelos de caracteres diferenciados para registro literario y moderno.
- Conversión neuronal kana-kanji con Zenzai (zenz-v3.2-small), que aporta un segundo motor de conversión de base neuronal.
- Detección y señalización de erratas en texto japonés mediante los modelos Sarashina 2.2 (1B y 3B) bajo la función Chunagon.
- Procesamiento de texto exclusivamente en japonés.
- Integración como backend de un IME de escritorio Windows; no está pensado para uso como modelo de propósito general.
- No se documentan tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Entrada de texto japonés en Windows: el IME yokiKana carga estos pesos para convertir secuencias de kana en kanji mientras el usuario escribe, combinando el motor Shonagon con Zenzai según la configuración.
- Corrección de erratas en redacción japonesa: los modelos Sarashina 2.2 en Q8_0 permiten señalar errores tipográficos o de elección de kanji en el texto introducido antes de confirmarlo.
- Conversión con registro adaptable: la disponibilidad de un charLM de registro literario y otro de registro moderno permite ajustar el estilo de conversión a textos formales o contemporáneos.
- Despliegue de un IME neuronal en equipos de sobremesa: al distribuir los LLM en GGUF Q8_0 y el modelo de conversión en Q5_K_M, el conjunto puede ejecutarse en CPU sin depender de GPU dedicada.
- Investigación sobre IME neuronales: el repositorio sirve como referencia de integración de un corrector basado en LLM dentro de un motor de conversión clásico con CNN y charLM.
- Reutilización de componentes: los modelos Sarashina 2.2 y Zenzai pueden emplearse por separado en otras aplicaciones de procesamiento de japonés respetando sus licencias respectivas (MIT y Apache-2.0).
- Verificación de integridad en pipelines de distribución: el esquema de `weights.json` con revisión y SHA256 por fichero facilita la validación de descargas en instaladores automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 6,0 GB; el espacio en disco necesario para la instalación del IME debe contemplar ese tamaño más el del propio ejecutable.
- Sarashina 2.2 3B en Q8_0 requiere aproximadamente 3,2 GB de memoria para los pesos; el 1B en Q8_0, en torno a 1,1 GB. zenz-v3.2-small en Q5_K_M es un modelo pequeño, del orden de cientos de MB.
- Los modelos GGUF están pensados para ejecutarse con llama.cpp, lo que permite inferencia en CPU sin GPU dedicada.
- Las CNN de Shonagon se distribuyen en ONNX, por lo que requieren un runtime ONNX (ONNX Runtime u otro compatible).
- No se documentan latencias ni throughput medidos, ni GPU recomendadas específicas.
- El tamaño del conjunto sugiere que cabe en equipos de consumo convencionales, pero no se aportan cifras de VRAM ni de rendimiento por hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yokiKana-weights | Conjunto de pesos para IME (charLM + CNN + Zenzai + Sarashina) | 1.407.538.944 en total | no disponible | Mixta (yokiKana, Apache-2.0, MIT) | HuggingFace + GitHub Releases |
| sbintuitions/sarashina2.2-3b | LLM transformer japonés | 3B (componente incluido) | no disponible | MIT | HuggingFace |
| Miwa-Keita/zenz-v3.2-small-gguf | Modelo neuronal de conversión kana-kanji | small (componente incluido) | no disponible | Apache-2.0 | HuggingFace |
| IME comerciales (p. ej. Microsoft IME, Google Japanese Input) | Motor de conversión propietario | no disponible | no disponible | Propietaria | Distribución binaria |

La comparativa directa es limitada porque yokiKana-weights no es un modelo único sino un agregado de artefactos; las alternativas más cercanas son los propios componentes que incorpora y los IME comerciales cerrados.

## Limitaciones y advertencias

- Soporte exclusivo de japonés; no está diseñado ni validado para otros idiomas.
- Licencia mixta: cada componente tiene condiciones distintas. El uso comercial requiere revisar la licencia de yokiKana en el repositorio de releases, además de las licencias Apache-2.0 y MIT de Zenzai y Sarashina respectivamente.
- Los artefactos de Shonagon se entrenaron específicamente para yokiKana y su reutilización fuera del IME no está documentada.
- No hay información sobre sesgos, tasas de alucinación ni evaluación de calidad de la conversión o de la detección de erratas.
- La detección de erratas con LLM puede producir falsos positivos o sugerencias incorrectas; en un IME esto afecta directamente a la experiencia de escritura.
- No se documentan longitudes de contexto, por lo que no puede garantizarse el comportamiento en textos largos.
- El repositorio tiene un uso muy bajo (72 descargas, 0 likes) y fue creado en octubre de 2026; la madurez y el soporte de la comunidad son limitados.
- Los nombres de fichero son estables y los cambios se gestionan por revisión y SHA256; cualquier automatización debe validar esos hashes antes de cargar los pesos.

## Enlaces

- Repositorio de pesos en HuggingFace: https://huggingface.co/AkadashiOmiso/yokiKana-weights
- Releases del IME yokiKana: https://github.com/AkadashiOmiso/yokiKana-releases
- Modelo Zenzai de origen (GGUF): https://huggingface.co/Miwa-Keita/zenz-v3.2-small-gguf
- Sarashina 2.2 3B: https://huggingface.co/sbintuitions/sarashina2.2-3b
- Sarashina 2.2 1B: https://huggingface.co/sbintuitions/sarashina2.2-1b
