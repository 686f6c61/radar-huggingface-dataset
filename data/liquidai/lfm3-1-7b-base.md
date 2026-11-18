# LiquidAI/LFM3-1.7B-Base

## Resumen

LFM3-1.7B-Base es el checkpoint preentrenado de la familia LFM3 de Liquid AI, un modelo de lenguaje de 1,73 mil millones de parámetros disenado especificamente para despliegue en el borde (edge): telefonos moviles, portatiles y dispositivos con recursos limitados. Se trata del modelo base sobre el que se construye LFM3-1.7B, la variante conversacional e instruida, y esta pensado como punto de partida para preentrenamiento continuado y postentrenamiento propio.

La innovacion principal es su arquitectura tri-hibrida: de las 24 capas totales, 13 son convoluciones cortas con compuertas (gated short convolutions), 5 son atencion de ventana deslizante y 6 son atencion global. Esta mezcla reduce el coste computacional y de memoria frente a un transformer clasico de atencion completa, manteniendo una ventana de contexto de 256.000 tokens (entrada mas salida) que resulta notable para su tamano.

El modelo se ha preentrenado sobre 22 billones de tokens, de los cuales los ultimos 3,5 billones corresponden a datos de mid-training curados con trazas agenticas y llamadas a herramientas. A 4 bits ocupa aproximadamente 1 GB de memoria, lo que lo hace viable en practicamente cualquier dispositivo moderno. Soporta 16 idiomas y se distribuye bajo licencia LFM 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tri-hibrida: 24 capas (13 convoluciones cortas con compuertas, 5 atencion de ventana deslizante, 6 atencion global) |
| Parametros totales | 1.728.801.536 (1,73B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens (entrada + salida) |
| Tipos de cuantizacion | 4 bits mencionado por el autor (aproximadamente 1 GB); otros formatos no disponibles |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | LFM 1.0 (license: other) |
| Formato de pesos | safetensors (transformers, custom_code) |
| Vocabulario | 128.000 tokens |
| Tamano del repositorio | 3,5 GB |
| Tipo de checkpoint | Preentrenado, solo texto (base) |

## Arquitectura y entrenamiento

LFM3-1.7B-Base emplea una arquitectura tri-hibrida que combina tres tipos de capas en un unico transformer: convoluciones cortas con compuertas (gated short convolutions), atencion de ventana deslizante y atencion global. De las 24 capas, 13 son convolucionales, 5 usan atencion de ventana deslizante y 6 emplean atencion global. Este diseno busca reducir el coste de atencion cuadratica en secuencias largas manteniendo capacidad de modelado global, algo critico para un modelo que aspira a operar con 256K tokens de contexto en hardware de borde. El vocabulario es de 128.000 tokens.

El entrenamiento cubre 22 billones de tokens en total. Los ultimos 3,5 billones corresponden a una fase de mid-training con datos curados que incluyen trazas agenticas y llamadas a herramientas, y es en esta fase donde se extiende la ventana de contexto hasta los 256K tokens. Al ser un checkpoint base, no se ha aplicado postentrenamiento de tipo RLHF o DPO; el autor lo presenta explicitamente como material de partida para preentrenamiento continuado y postentrenamiento propio. La model card no detalla la composicion exacta del dataset ni innovaciones adicionales como decodificacion especulativa.

## Capacidades

- Generacion de texto autoregresiva: al ser un modelo base, la capacidad principal es la continuacion y generacion de texto, sin alineacion conversacional.
- Razonamiento y conocimiento general: preentrenado sobre 22T tokens, con capacidad de razonamiento basico y conocimiento factual propio de su escala.
- Codigo y matematicas: capacidad derivada del preentrenamiento; no se publican resultados especificos en la model card.
- Trazas agenticas y llamadas a herramientas: el mid-training incluye datos de agentic traces y tool calls, por lo que el modelo base ya ha visto patrones de uso de herramientas, aunque sin postentrenamiento especifico de tool calling.
- Multilingue: 16 idiomas declarados (ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso y polaco).
- Contexto largo: ventana de 256K tokens de entrada mas salida, adecuada para documentos extensos y conversaciones multi-turno largas.
- Base para especializacion: pensado para fine-tuning, preentrenamiento continuado y postentrenamiento por parte del usuario.
- No incluye vision, audio ni modo thinking (segun la informacion disponible; la familia LFM3 tiene variantes de vision, audio, omni y decision, pero este checkpoint es solo texto).

## Casos de uso

- Preentrenamiento continuado en dominio: el modelo sirve como inicializacion para adaptar el conocimiento a un dominio vertical (legal, medico, financiero) con corpus propios, aprovechando su contexto de 256K tokens para documentos largos.
- Postentrenamiento y alineacion propios: equipos que quieran construir su propio modelo instruido o conversacional pueden partir de este checkpoint y aplicar SFT, DPO o RLHF segun sus necesidades, en lugar de depender de la variante ya alineada.
- Agentes locales en dispositivos: gracias a sus aproximadamente 1 GB a 4 bits, puede ejecutarse en telefonos y portatiles para tareas de agente ligero (resumen, extraccion, clasificacion) sin conexion a la nube, con los datos permaneciendo en el dispositivo.
- Procesamiento de documentos largos en el borde: con 256K tokens de contexto, puede resumir o extraer informacion de contratos, informes o transcripciones extensas directamente en un portatil, sin enviar el contenido a un servidor.
- Generacion de codigo asistida en local: integrable en editores o herramientas de desarrollo que necesiten autocompletado o generacion de fragmentos sin latencia de red, aprovechando su capacidad de codigo derivada del preentrenamiento.
- Investigacion en arquitecturas hibridas: su combinacion de convoluciones y atencion lo convierte en una base util para estudiar eficiencia, extrapolacion de contexto y comportamiento de capas hibridas en modelos pequenos.
- Clasificacion y etiquetado a gran escala: al ser un modelo base, puede adaptarse con cabezas de clasificacion o fine-tuning ligero para tareas de moderacion, enrutamiento o etiquetado multilingue en 16 idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB a 4 bits segun el autor; en precision completa (fp16/bf16) el checkpoint de 1,73B requiere del orden de 3,5 GB de pesos mas overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 en adelante, RTX 4090) puede ejecutarlo con holgura; en entornos de servidor, A100 o H100 no son necesarios para inferencia, aunque pueden usarse para fine-tuning.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con al menos 4-6 GB de VRAM en cuantizacion, y en CPU con suficiente RAM.
- Despliegue en movil y portatil: el autor indica que a 4 bits ocupa aproximadamente 1 GB y cabe en cualquier telefono o portatil.
- Opciones de despliegue: transformers (libreria declarada, con custom_code); vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion disponible, por lo que su compatibilidad no esta confirmada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Base | 1,73B | 256K | Tri-hibrida (conv + atencion) | LFM 1.0 | Base preentrenado, 16 idiomas, orientado a edge |
| LFM3-1.7B | 1,73B | 256K | Tri-hibrida | LFM 1.0 | Variante instruida/conversacional del mismo checkpoint |
| Alternativas de ~1-2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada para comparar con modelos de la competencia |

## Limitaciones y advertencias

- Es un checkpoint base, no un modelo instruido: no esta alineado para conversacion, no sigue instrucciones de forma fiable y puede generar contenido inapropiado o divagante sin postentrenamiento.
- Riesgo de alucinacion: como todo modelo de lenguaje preentrenado, puede producir afirmaciones factualmente incorrectas con aparente seguridad.
- Sesgos: no se documentan evaluaciones de sesgo en la model card; al entrenarse sobre datos web a gran escala, es probable que herede sesgos de esos datos.
- Licencia LFM 1.0 (license: other): no es una licencia open source estandar; es necesario revisar el archivo LICENSE del repositorio para conocer las restricciones exactas de uso comercial antes de desplegarlo en produccion.
- Idiomas: aunque declara 16 idiomas, el rendimiento relativo por idioma no se documenta; el espanol esta incluido pero sin metricas publicadas.
- Contexto: los 256K tokens son la ventana nominal; el rendimiento real en contextos muy largos no se ha verificado con benchmarks publicados en la informacion disponible.
- Compatibilidad de despliegue: al requerir custom_code en transformers, puede no funcionar directamente en todos los runners de inferencia sin adaptaciones.
- Sin datos de benchmarks: no hay resultados publicados que permitan validar el rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Variante instruida LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- Coleccion LFM3: https://huggingface.co/collections/LiquidAI/lfm3
- Blog de lanzamiento: https://www.liquid.ai/blog/lfm3
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola / API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
