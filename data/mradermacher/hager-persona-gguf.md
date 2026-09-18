# mradermacher/hager-persona-GGUF

## Resumen

hager-persona-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo Hager290/hager-persona. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos orientada a inferencia local: el autor aplica su pipeline habitual de cuantizacion estatica sobre los pesos originales en precision completa (f16) para producir doce variantes que cubren desde 1,4 GB hasta 6,3 GB en disco. El modelo base es un transformer decoder-only de tipo Qwen2, segun la etiqueta `qwen2` declarada, con 3.085.938.688 parametros totales (aproximadamente 3,09 mil millones) verificados en los safetensors del modelo original.

El proposito del repositorio es doble. Por un lado, reducir los requisitos de memoria del modelo base para que pueda ejecutarse en hardware de consumo (tarjetas graficas de 6-8 GB de VRAM, equipos Apple Silicon o incluso CPU). Por otro, ofrecer una horquilla de niveles de compresion que permita al usuario elegir el equilibrio entre calidad y huella de memoria, algo especialmente relevante en un modelo de 3B donde la diferencia entre Q4_K_M y f16 es de mas de 4 GB.

La relevancia actual del repositorio es limitada pero funcional: se publico el 18 de septiembre de 2026 y en el momento de redactar esta ficha acumula 0 descargas y 0 likes, no hay benchmarks publicados ni model card detallada del modelo base mas alla de sus metadatos. Es, por tanto, un artefacto de cuantizacion para experimentacion, no un modelo con validacion publica de rendimiento. El apelativo "persona" en el nombre sugiere un ajuste orientado a conversacion con personalidad definida, coherente con la etiqueta `conversational`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Qwen2 (segun etiqueta `qwen2` del repositorio; no confirmado en model card) |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Modelo base | Hager290/hager-persona |
| Cuantizador | mradermacher |
| Tamano del repositorio | 27,9 GB (suma de las 12 cuantizaciones) |
| Libreria declarada | transformers |
| Fecha de creacion | 2026-09-18 |
| Fecha de actualizacion | 2026-09-18 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe el entrenamiento del modelo base. Lo unico que se puede afirmar con los datos proporcionados es que la etiqueta `qwen2` indica que la arquitectura subyacente es la familia Qwen2 (transformer decoder-only con atencion causal, normalizacion RMSNorm y capas MLP con activacion SwiGLU, en la formulacion habitual de esta familia), y que el recuento real de parametros de los safetensors es de 3.085.938.688. El repositorio no incluye informacion sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre si el modelo base partio de un checkpoint preentrenado de Qwen2 o de un ajuste sobre otro modelo. Tampoco se documenta ninguna innovacion tecnica especifica (atencion lineal, decodificacion especulativa, atencion con ventana deslizante, etc.).

En lo que respecta al proceso de cuantizacion, los metadatos embebidos en la model card aportan dos datos concretos: `quantize_version: 2` y `output_tensor_quantised: 1`. Ademas, el autor indica que las cuantizaciones son estaticas y que en el momento de la publicacion no habia publicado variantes con imatrix o ponderadas (weighted/imatrix quants). Esto implica que las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar mas la perplejidad que sus equivalentes generadas con matriz de importancia, especialmente en modelos pequenos donde cada bit cuenta. El autor remite a la grafica de ikawrakow sobre perplejidad de cuantizaciones de baja calidad y al analisis de Artefact2 para contextualizar el compromiso calidad/tamano.

## Capacidades

Las capacidades que se listan a continuacion se infieren del tipo de modelo (Qwen2 de 3B ajustado para conversacion) y de las etiquetas del repositorio. No hay evaluaciones publicadas que las confirmen para este modelo concreto.

- Generacion de texto conversacional en ingles: el modelo esta etiquetado como `conversational`, lo que apunta a un ajuste orientado a dialogo multi-turno.
- Razonamiento basico y respuesta a instrucciones: es razonable esperar comportamiento de instruccion propio de un modelo de 3B de la familia Qwen2, aunque no hay validacion publica.
- Generacion de codigo: no documentada explicitamente; un modelo de 3B de esta familia suele resolver tareas sencillas de autocompletado y scripts, con limitaciones en razonamiento de codigo complejo.
- Tool calling / function calling: no disponible. La model card no menciona soporte de llamadas a herramientas ni plantillas de tool use.
- Soporte de agentes y razonamiento multi-paso: no disponible. No se documenta ningun modo de razonamiento explicito ni capacidad agentica.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`; el resto de idiomas no estan declarados.
- Capacidades especiales (vision, audio, thinking mode): no disponibles. No hay ninguna indicacion de modalidades adicionales ni de modo de pensamiento extendido.
- Inferencia local eficiente: esta es la capacidad practica mas clara del repositorio, derivada del formato GGUF y de la horquilla de cuantizaciones desde Q2_K (1,4 GB) hasta f16 (6,3 GB).

## Casos de uso

- Asistente conversacional local sin conexion: el modelo puede ejecutarse integramente en una maquina personal mediante llama.cpp u Ollama, sin enviar datos a servicios externos. Es util en entornos con requisitos de privacidad (despachos legales, sanidad, desarrollo en redes aisladas) donde no se permite salida de datos.
- Prototipado rapido de chatbots con personalidad: dado el nombre "persona" del modelo base, encaja en experimentos de caracterizacion de asistentes (tono, estilo, rol) antes de escalar a modelos mayores. El coste de iteracion es bajo porque cada prueba requiere apenas 2 GB de VRAM en Q4_K_M.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce niveles de compresion del mismo modelo, lo que lo convierte en un banco de pruebas practico para medir la degradacion de perplejidad y de calidad de respuesta entre Q2_K, Q4_K_M, Q8_0 y f16 sobre un mismo prompt set.
- Procesamiento por lotes en CPU: con Q4_K_S (1,9 GB) el modelo cabe comodamente en RAM y puede ejecutarse en servidores sin GPU para tareas de clasificacion, resumen o reescritura de textos en ingles a bajo coste.
- Educacion e investigacion sobre cuantizacion: sirve como caso de estudio de un pipeline de cuantizacion estatica frente a cuantizacion con imatrix, permitiendo comparar en un modelo pequeno las diferencias de calidad que el autor documenta con referencias externas.
- Generacion de texto auxiliar en aplicaciones de escritorio: integrable en editores, plugins o herramientas CLI mediante llama-cpp-python para autocompletado, reescritura o generacion de borradores en ingles con latencia aceptable en GPU de gama media.
- Despliegue en dispositivos con memoria unificada: en equipos Apple Silicon o mini-PC con 8-16 GB de RAM, la variante Q4_K_M o Q5_K_M permite tener el modelo permanentemente cargado junto al resto del sistema operativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica, ni para el modelo base ni para las cuantizaciones derivadas. Tampoco se proporcionan datos de perplejidad medidos por el cuantizador; la unica referencia es una grafica externa de ikawrakow sobre tipos de cuantizacion de baja calidad, no especifica de este modelo.

## Requisitos de hardware

Estimaciones basadas en el tamano en disco de cada cuantizacion mas el overhead de contexto y del runtime (valores orientativos, no publicados por el autor):

- Q2_K (1,4 GB): aproximadamente 2 GB de VRAM/RAM. Ejecutable en GPU integrada o en CPU.
- Q4_K_S / Q4_K_M (1,9-2,0 GB): aproximadamente 2,5-3,5 GB segun longitud de contexto. Opcion recomendada por el propio autor ("fast, recommended"). Cabe en GTX 1650 4 GB, RTX 3050 6 GB, RTX 4060 8 GB.
- IQ4_XS (1,9 GB): alternativa de 4 bits con mejor relacion calidad/tamano que los Q4_K en muchos casos.
- Q5_K_S / Q5_K_M (2,3 GB): aproximadamente 3-4 GB con contexto moderado.
- Q6_K (2,6 GB): aproximadamente 3,5-4,5 GB. El autor lo marca como "very good quality".
- Q8_0 (3,4 GB): aproximadamente 4,5-5,5 GB.
- f16 (6,3 GB): aproximadamente 7-8 GB. El autor lo califica de "overkill" para este tamano de modelo.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM para cuantizaciones de 4-5 bits (RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090); A100 o H100 solo tendrian sentido para servir muchas peticiones concurrentes, no por requisito de memoria.
- Cabe en GPU de consumo: si, en practicamente todas las tarjetas de los ultimos seis anos, incluso con cuantizacion Q4_K_M en modelos de 4 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, koboldcpp y servidores compatibles con GGUF. La etiqueta `text-generation-inference` aparece en los metadatos, aunque TGI trabaja preferentemente con safetensors; para GGUF el soporte es limitado. vLLM incorpora soporte GGUF parcial y experimental. No se documenta compatibilidad oficial con ninguna de estas herramientas en la model card.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

La comparativa se limita a los datos verificables. No hay resultados de rendimiento publicados para ninguna de las alternativas en la informacion disponible, por lo que la columna de rendimiento se deja como no disponible en todos los casos.

| Modelo | Parametros | Contexto | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| hager-persona (este repositorio, cuantizado) | 3,09 B | no disponible | Apache 2.0 | GGUF | no disponible |
| Hager290/hager-persona (modelo base) | 3,09 B | no disponible | Apache 2.0 | safetensors | no disponible |
| Qwen2.5-3B-Instruct (referencia de la misma familia y tamano) | ~3,1 B | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF (via terceros) | no disponible |
| Llama-3.2-3B-Instruct (alternativa de tamano comparable) | ~3,2 B | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF (via terceros) | no disponible |

Nota: los valores de contexto y licencia de las alternativas no se han verificado en fuentes proporcionadas, por lo que se marcan como no disponibles en lugar de asumir cifras. Cualquier eleccion entre estos modelos deberia basarse en una evaluacion directa sobre el caso de uso concreto.

## Limitaciones y advertencias

- Ausencia total de validacion publica: 0 descargas, 0 likes y ninguna evaluacion de benchmarks. No hay evidencia externa de que el modelo funcione correctamente en tareas reales.
- Trazabilidad del modelo base incompleta: no se documenta el dataset de entrenamiento, el numero de tokens, el proceso de alineamiento ni si el modelo base es a su vez un ajuste fino de otro checkpoint. Esto dificulta evaluar sesgos y procedencia de los datos.
- Idioma: solo se declara ingles. El rendimiento en castellano u otros idiomas no esta soportado ni documentado.
- Riesgo de alucinacion: inherente a cualquier modelo de 3B, y probablemente acentuado en este caso por la falta de informacion sobre el ajuste y por el caracter "persona" del modelo, que puede priorizar la coherencia de estilo sobre la exactitud factual.
- Degradacion por cuantizacion: las variantes Q2_K y Q3_K_S, en un modelo de solo 3B, pueden sufrir perdidas notables de calidad. El autor no aporta perplejidades propias para respaldar la eleccion entre niveles.
- Ausencia de cuantizaciones con imatrix: el autor indica explicitamente que no habia publicado cuantizaciones ponderadas, lo que limita la calidad alcanzable en los niveles de 2-4 bits.
- Sin soporte documentado de tool calling ni de modo agente: no debe asumirse capacidad de function calling en produccion.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al ser una licencia heredada del modelo base, el usuario deberia verificar que el modelo original Hager290/hager-persona mantiene efectivamente esa licencia y no impone restricciones adicionales.
- Fecha de creacion atipica (2026-09-18) y republicacion inmediata: el repositorio se creo y actualizo el mismo dia, sin historial de mantenimiento posterior.
- Uso en produccion desaconsejado sin evaluacion previa: dado el estado del repositorio, cualquier despliegue productivo deberia ir precedido de una bateria de pruebas propia sobre el dominio objetivo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/hager-persona-GGUF
- Modelo base: https://huggingface.co/Hager290/hager-persona
- Pagina de descargas y vision general del cuantizador: https://hf.tst.eu/model#hager-persona-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador (nethype GmbH): https://www.nethype.de/

Nota: los resultados de la busqueda web proporcionada no guardan relacion con el modelo (corresponden a articulos sobre la aerolinea Transavia) y no se han incluido como fuentes. No se han encontrado papers, blogs tecnicos ni demos asociados a este repositorio.
