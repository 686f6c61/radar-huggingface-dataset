# joshiyash666/bharat-sahayak-gemma4-e2b-GGUF

## Resumen

Bharat Sahayak (भारत सहायक) es un ajuste fino mediante LoRA del modelo Gemma 4 E2B de Google DeepMind, desarrollado por Yash Joshi (usuario joshiyash666). Se trata de un asistente conversacional de dominio restringido disenado para agricultores de la India, con capacidad de invocar herramientas para obtener datos verificables (fechas, estaciones, meteorologia, precios de mercado, esquemas gubernamentales) en lugar de generar cifras por su cuenta. El modelo responde en hindi, marati e ingles, incluyendo variantes en escritura latina y estilo Hinglish.

El repositorio publicado contiene unicamente los pesos en formato GGUF con cuantizacion Q4_K_M, pensados para ejecucion en llama.cpp y en telefonos moviles mediante Termux. El adaptador LoRA original se distribuye en un repositorio separado. El modelo base declara 4.647.450.147 parametros totales en safetensors y una ventana de entrenamiento de 2048 tokens.

Su relevancia radica en el enfoque "offline-first" y en el diseno de seguridad: el modelo rechaza compartir OTP, no prescribe dosis de pesticidas y no realiza reservas ni pagos, limitandose a explicar y dirigir al recurso adecuado. Las herramientas son las que aportan los datos factuales, lo que elimina la invencion de cifras en las respuestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B, modelo base de Google DeepMind); ajuste fino LoRA |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrenamiento con max_seq_length=2048) |
| Tipos de cuantizacion | Q4_K_M (unico publicado en este repositorio) |
| Idiomas soportados | hi, mr, en (hindi, marati, ingles; incluye Hinglish y escritura latina) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (adaptador LoRA original en repositorio separado) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E2B-it, un transformer de aproximadamente 4.650 millones de parametros, sobre el que se aplica un ajuste fino QLoRA con rango 16 usando Unsloth sobre una unica GPU Kaggle T4 en fp32, con longitud maxima de 2048 tokens. La perdida se calcula unicamente sobre los turnos generados por el modelo, enmascarando los resultados de las herramientas para que no contribuyan al gradiente.

El entrenamiento se realizo en dos fases: las versiones v1 y v2 usaron 10.000 conversaciones (625 pasos); la v3 continuo desde v2 con 4.000 conversaciones nuevas, tasa de aprendizaje 1e-4 y 250 pasos. El corpus total son 14.651 conversaciones sinteticas multi-turno, 24 intenciones y 6 estilos linguisticos (hindi en devanagari y romanizado, marati en devanagari y romanizado, Hinglish e ingles), con aproximadamente el 40 % en estilo voz con ruido de ASR. Los hechos provienen de un paquete de conocimiento con fuentes citadas (calendarios de cultivo de ICAR y universidades agrarias estatales, paginas de esquemas y lineas de ayuda). La innovacion principal no es arquitectonica sino de diseno: el uso nativo de tool calling de Gemma 4 para delegar todo dato factual a herramientas externas.

## Capacidades

- Generacion de texto conversacional multi-turno en hindi, marati, ingles y Hinglish, en escritura devanagari o latina.
- Tool calling nativo de Gemma 4 con nueve herramientas: `get_today_context`, `get_crop_calendar`, `get_varieties`, `get_weather`, `get_mandi_price`, `recommend_equipment`, `kb_lookup` (12 intenciones fijas), `open_page` y `open_dialer`.
- Razonamiento multi-paso orientado a agentes: seleccion de herramienta, generacion de argumentos y continuacion tras recibir el resultado.
- Apertura de paginas y marcacion telefonica solo tras confirmacion explicita del usuario (consentimiento).
- Cobertura tematica agricola: siembra, variedades, dosis de semilla, meteorologia, riego, maquinaria, precios de mercado, esquemas gubernamentales y reclamaciones de seguros de cosecha.
- Comportamiento de seguridad: rechazo de compartir OTP, aviso de llamadas fraudulentas (linea 1930) y derivacion a KVK o etiqueta del producto en lugar de dar dosis de pesticidas.
- Adaptacion a entradas estilo voz con ruido de ASR.
- No dispone de vision, audio nativo ni modo de razonamiento extendido segun la informacion disponible.

## Casos de uso

- Asistencia agricola offline en zonas rurales: el modelo se ejecuta en llama.cpp sobre el telefono del agricultor mediante Termux, sin conexion permanente, consultando meteorologia en vivo desde Open-Meteo cuando hay red y respondiendo con el calendario de cultivo local en caso contrario.
- Consulta de calendario de siembra y variedades: ante preguntas como que sembrar ahora o si es tarde para sembrar, el modelo invoca `get_crop_calendar` y `get_varieties` y responde con datos del paquete de conocimiento de ICAR en lugar de improvisar.
- Planificacion de tratamientos y riego segun meteorologia: usa `get_weather` para recomendar ventanas de pulverizacion, riego o alertas de helada, evitando que el agricultor aplique tratamientos en momentos desfavorables.
- Consulta de precios de mercado y MSP: mediante `get_mandi_price` el modelo ofrece precios reales del mercado mayorista y del precio minimo de sosten, sin inventar cifras, lo que es critico para decisiones de venta.
- Orientacion sobre esquemas y creditos: responde sobre PM-KISAN, prestamos KCC, precio de fertilizantes o reclamaciones PMFBY, y solo abre el portal oficial con `open_page` tras el consentimiento del usuario.
- Atencion telefónica de bajo riesgo: el modelo explica y marca lineas de ayuda con `open_dialer` tras confirmacion, pero nunca completa formularios, realiza pagos ni gestiona OTP, lo que lo hace apto para despliegues con poblacion vulnerable.
- Soporte multilingue en centros de extension agraria: permite atender consultas en hindi, marati e ingles con un unico modelo de 4,6 mil millones de parametros desplegable en hardware modesto.

## Benchmarks y rendimiento

Resultados sobre un conjunto de prueba retenido de 600 turnos con formulaciones y distritos no vistos, segun la model card:

| Metrica | Gemma 4 E2B base | Bharat Sahayak v3 |
|---|---|---|
| Herramienta correcta elegida | 27,3 % (base v1, 200 turnos) | 98,9 % |
| Argumentos correctos | 14,8 % | 95,1 % |
| Respuestas con cifras inventadas | 16 / 192 | 0 |
| Violaciones de consentimiento / OTP / dosis | no disponible | 0 |

La model card menciona una evaluacion con el comprobador AST oficial sobre datos publicos de BFCL v4, pero los resultados se publicarian en `bfcl_results.json` una vez ejecutados; no se proporcionan cifras en la informacion disponible. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio GGUF ocupa 3,4 GB en Q4_K_M, por lo que la inferencia requiere aproximadamente 4-5 GB de memoria considerando el contexto.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM; el entrenamiento se realizo en una T4 de 16 GB, suficiente tambien para inferencia holgada.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti (8/16 GB) o RTX 4090; tambien en telefonos moviles mediante llama.cpp y Termux.
- Opciones de despliegue: llama.cpp (`llama-server -m bharat_sahayak.Q4_K_M.gguf --jinja`), Termux en Android, y el adaptador LoRA con Unsloth (`FastModel.from_pretrained(..., load_in_4bit=True)`). No se documentan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bharat Sahayak v3 (este) | 4.647 M | no disponible (entrenamiento a 2048) | Asistente agricola con tool calling, hindi/marati/ingles | Apache-2.0 | GGUF en HF, adaptador LoRA |
| Gemma 4 E2B-it (base) | 4.647 M | no disponible | Modelo generalista instruido | Gemma (terminos de Google) | Pesos oficiales de Google |
| Alternativas de asistencia agricola en hindi | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Dominio restringido a agricultura; el autor indica que pequenos negocios y vida diaria quedaran para versiones posteriores.
- El paquete de conocimiento esta fechado el 2026-11-08: importes y fechas de esquemas gubernamentales cambian y pueden quedar desactualizados.
- Los datos de entrenamiento son sinteticos; el habla real de agricultores sera mas ruidosa y variada, por lo que se esperan fallos no cubiertos.
- Fallos conocidos: las preguntas sobre subvenciones para compra de drones a veces se derivan a la subvencion general de maquinaria; ocasionalmente invoca `kb_lookup` antes de rechazar una dosis de pesticidas.
- No sustituye a un agronomo, a un KVK ni a los portales oficiales de esquemas.
- Riesgo de alucinacion mitigado por diseno (las herramientas aportan los datos), pero depende de que la aplicacion anfitriona implemente correctamente las herramientas y no invente resultados.
- Licencia Apache-2.0 para el ajuste fino, aunque el modelo base Gemma tiene sus propios terminos de uso; el proyecto no esta afiliado ni respaldado por Google y Gemma es marca de Google LLC.
- Solo se publica la cuantizacion Q4_K_M en este repositorio; no hay variantes Q5, Q8 ni fp16 en la informacion disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/joshiyash666/bharat-sahayak-gemma4-e2b-GGUF
- Adaptador LoRA: https://huggingface.co/joshiyash666/bharat-sahayak-gemma4-e2b
- Dataset, herramientas y generador: https://huggingface.co/datasets/joshiyash666/bharat-sahayak-farm-tools
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
