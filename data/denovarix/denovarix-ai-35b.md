# Denovarix/Denovarix-AI-35B

## Resumen

Denovarix AI 35B es un modelo de lenguaje multimodal anunciado por Denovarix Technologies LLP, empresa con sede en Bengala Occidental (India), como parte de su familia de modelos propios integrados en el sistema operativo DNX OS. Segun la model card, esta pensado como el nivel "workstation" de la familia: un modelo que procesa texto e imagenes, decide que herramientas invocar y mantiene en vista trabajos largos (informes extensos, tablas grandes, colecciones de documentos) sobre una unica maquina de oficina, sin depender de servicios en la nube.

El modelo declara 35 mil millones de parametros y un uso de memoria de aproximadamente 23 GB, disenado para ejecutarse en estaciones de trabajo con 60 GB de RAM. Soporta tres idiomas: ingles, hindi y bengali. Entre sus capacidades declaradas figuran la generacion de texto, la comprension de documentos, el razonamiento multi-paso y el tool calling, orientado a automatizaciones construidas en DNX Flow.

Es importante senalar que, en el momento de redactar esta ficha, el modelo esta **en desarrollo y no disponible**: los pesos no se han publicado en Hugging Face y la model card lo indica explicitamente. La licencia tampoco esta especificada. Por tanto, los datos tecnicos disponibles son los que el autor declara en su model card, sin verificacion independiente ni resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no especifica transformer, MoE ni hibrida) |
| Parametros totales | 35 mil millones (35B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se menciona un uso de ~23 GB de memoria, compatible con precision reducida, pero sin detallar formatos) |
| Idiomas soportados | Ingles (en), hindi (hi), bengali (bn) |
| Licencia | No disponible |
| Formato de pesos | No disponible (los pesos no estan publicados) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna del modelo: no se indica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura hibrida con atencion lineal o cualquier otra variante. Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La unica informacion tecnica concreta es el tamano (35B parametros) y la huella de memoria declarada (~23 GB en uso), lo que sugiere un despliegue con pesos en precision reducida (por ejemplo, FP8 o cuantizacion de 4-8 bits) para encajar en una estacion de trabajo de 60 GB de RAM.

Las capacidades declaradas (entrada de texto e imagenes, tool calling, comprension de documentos y razonamiento multi-paso) implican al menos un codificador visual o un mecanismo de proyeccion multimodal, pero el autor no detalla como se implementa ni que innovaciones tecnicas incorpora (decodificacion especulativa, atencion lineal, etc.). Toda esta informacion queda pendiente de la publicacion tecnica o de los pesos del modelo.

## Capacidades

- Generacion de texto en ingles, hindi y bengali.
- Comprension de imagenes (pipeline declarado `image-text-to-text`), lo que permite procesar documentos escaneados, capturas y material visual junto con texto.
- Comprension de documentos: lectura y analisis de informes largos, tablas grandes y colecciones documentales.
- Tool calling / function calling: el modelo decide que herramientas invocar, orientado a automatizaciones en DNX Flow.
- Razonamiento multi-paso para tareas de analisis que requieren mantener contexto a lo largo de varios pasos.
- Capacidad de ejecucion local en una estacion de trabajo, sin dependencia de la nube (segun el autor).
- No se declaran capacidades de audio, modo "thinking" explicito ni agentes autonomos mas alla del tool calling y el razonamiento multi-paso.

## Casos de uso

- Analisis de documentacion corporativa: lectura de informes financieros, contratos o memorandos en PDF e imagenes, con extraccion de datos y resumenes, aprovechando la entrada multimodal y la orientacion a documentos del modelo.
- Analisis de tablas y hojas de calculo extensas: interpretacion de tablas grandes para responder preguntas de negocio, detectar anomalias o generar resumenes ejecutivos, gracias a su capacidad declarada para trabajar con tablas grandes.
- Automatizacion de flujos de trabajo en DNX Flow: integracion del tool calling para que el modelo orqueste pasos (consultas a bases de datos, generacion de informes, envio de correos) en pipelines internos.
- Asistencia a analistas y directivos: un asistente local que mantiene el contexto de multiples documentos de un proyecto y responde preguntas de seguimiento sin enviar datos a terceros.
- Procesamiento de documentos en hindi y bengali: atencion a mercados del sur de Asia, con lectura de documentos y correspondencia en esos idiomas ademas del ingles.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en una estacion de trabajo local de 60 GB, permite tratar informacion sensible (legal, sanitaria, financiera) sin salir de la red corporativa.
- Digitalizacion y clasificacion de archivos: procesamiento de lotes de documentos escaneados (imagenes) para extraer texto, clasificarlos y resumirlos en un flujo automatizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el autor declara un uso de aproximadamente 23 GB de memoria para el modelo de 35B parametros, y recomienda estaciones de trabajo con 60 GB de memoria.
- GPU recomendadas: no disponibles. El autor no especifica GPU concretas; el requisito declarado es memoria total de la maquina (60 GB), lo que sugiere que el modelo puede ejecutarse en CPU/GPU con memoria unificada o en GPUs con suficiente VRAM.
- Cabe en GPU de consumo: no confirmado. Con ~23 GB en uso, seria viable en GPUs de 24 GB (por ejemplo, RTX 4090) solo si el reparto de memoria y la cuantizacion lo permiten, pero el autor no lo confirma; el requisito declarado de 60 GB apunta a configuraciones de mayor capacidad.
- Opciones de despliegue: no disponibles (no se especifican vLLM, llama.cpp, Ollama, TGI ni el runtime propio de DNX OS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no ofrece comparaciones con otros modelos, y al no haber benchmarks ni pesos publicados no es posible establecer una comparacion rigurosa con alternativas de tamano similar (por ejemplo, modelos densos de 30-40B o MoE de esa escala).

## Limitaciones y advertencias

- Modelo no disponible: los pesos no estan publicados y el autor indica que esta en desarrollo; no puede evaluarse ni desplegarse hoy.
- Licencia no especificada: no hay condiciones de uso comercial, redistribucion ni modificacion; es imprescindible contactar con el autor antes de cualquier uso en produccion.
- Sin benchmarks ni evaluacion independiente: no hay datos verificables de rendimiento, calidad ni robustez.
- Cobertura linguistica limitada: solo ingles, hindi y bengali; no se declara soporte de castellano ni de otros idiomas.
- Riesgo de alucinacion: inherente a los modelos generativos; sin datos de evaluacion no puede acotarse su magnitud.
- Sesgos: no se documentan sesgos conocidos ni procesos de alineacion; al entrenarse presumiblemente con datos multilingues del sur de Asia, pueden aparecer sesgos culturales y linguisticos no evaluados.
- Contexto y multimodalidad sin verificar: no se especifica la longitud de contexto ni el detalle del procesamiento de imagenes, lo que impide planificar casos de uso con documentos muy largos.
- Dependencia del ecosistema DNX OS: las capacidades de tool calling y automatizacion parecen ligadas a DNX Flow y DNX OS, lo que puede limitar la portabilidad a otros entornos.
- Empresa y modelo poco contrastados: Denovarix es un proveedor pequeno y el modelo no tiene traccion publica (0 descargas, 0 likes en Hugging Face); conviene tratarlo con cautela en decisiones de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Denovarix/Denovarix-AI-35B
- Sitio web de Denovarix: https://denovarix.com
- Pagina de DNX OS: https://denovarix.com/dnx-os/
- Programa beta de DNX OS: https://denovarix.com/beta/
- Contacto: hello@denovarix.com
