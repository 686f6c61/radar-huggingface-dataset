# henriqueimoveis/Echoes-1.5-Instruct-PT-BR

## Resumen

Echoes-1.5-Instruct-PT-BR es un modelo de lenguaje de 870 millones de parámetros desarrollado por henriqueimoveis, entrenado desde cero en portugués brasileño sobre la TPU v5e-8 gratuita de Kaggle. Es la variante de instrucción del modelo base Echoes-1.5-Base-PT-BR y su rasgo más distintivo es que no sigue un chat template convencional como ChatML, sino que reproduce el registro de un foro brasileño de los años 2000: el prompt se construye como `Pessoa 1: {pregunta}\nEchoes:`, y el modelo responde con el estilo coloquial, con errores ortográficos deliberados y sin cortesías de asistente moderno.

El modelo declara `model_type: qwen3_next` en su configuración, aunque es denso y todas sus 18 capas usan atención completa. Se preentrenó con 20 000 millones de tokens de corpus en portugués brasileño (incluyendo foros como Orkut, Adrenaline y HardMOB) y posteriormente se afinó con 6,6 millones de tokens de instrucción en 8 épocas. Su ventana de contexto es de 4096 posiciones, aunque se entrenó en secuencias de 2048. La licencia es WTFPL, lo que permite cualquier uso sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (model_type: qwen3_next, 18 capas full attention) |
| Parametros totales | 870 248 448 (870M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (entrenado en 2048) |
| Tipos de cuantizacion | No documentado oficialmente; compatible con bfloat16 y cuantizaciones estandar de transformers |
| Idiomas soportados | Portugues de Brasil (pt-BR) |
| Licencia | WTFPL (Do What The Fuck You Want To Public License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo usa una arquitectura transformer densa con 18 capas de atencion completa, aunque su configuracion declara `model_type: qwen3_next`. Esta discrepancia provoca un comportamiento particular: la implementacion de `generate()` intenta montar una mascara de atencion lineal incluso cuando todas las capas son de atencion completa, lo que obliga a pasar `use_cache=False` para evitar un error de `LinearAttention`. Al ser un modelo pequeno con contexto corto, reprocesar la ventana completa tiene un coste asumible.

El entrenamiento se realizo en dos fases. La primera fue un preentrenamiento desde cero con 20 000 014 336 tokens de corpus en portugues brasileño, que incluye foros de los años 2000 como Orkut, Adrenaline y HardMOB, entre otras fuentes. La segunda fue un ajuste fino supervisado (SFT) con 6,6 millones de tokens de corpus de instruccion, 8 epocas y 474 pasos, sumando un total de 20 062 142 464 tokens. El corpus de SFT mantiene la forma del preentrenamiento (documento de foro) y solo cambia el rol de quien responde: se usan pares reales extraidos de foros como ancla de estilo, datos sinteticos por buckets (identidad, calibracion, entidad desconocida, premisa falsa, borde) y un bloque de aritmetica generado en Python. No se anade ningun token nuevo ni template de chat.

## Capacidades

- Generacion de texto en portugues brasileño con registro coloquial de foro de los años 2000, incluyendo gíria, errores ortograficos intencionales y opiniones contundentes.
- Admision de desconocimiento: el modelo reconoce cuando no conoce una entidad o hecho en lugar de inventar, como muestra el ejemplo de "Vortex Marmelada Azul".
- Correccion de premisas falsas: detecta y corrige afirmaciones incorrectas del usuario (por ejemplo, atribuir The Sims a Notch).
- Mantenimiento de identidad bajo presion: responde de forma consistente como "Echoes" sin desviarse al modo base.
- Traduccion: capacidad basica de traduccion, mencionada en la evaluacion del autor.
- Sin soporte de tool calling ni function calling documentado.
- Sin capacidades multimodales ni de audio.
- Sin modo de razonamiento explicito (thinking mode).

## Casos de uso

- Generacion de contenido con registro de foro retro: el modelo puede producir textos que imiten conversaciones de foros brasileños de los años 2000, util para proyectos de nostalgia, arqueologia digital o generacion de datasets de estilo.
- Simulacion de interacciones en comunidades online: permite crear agentes que respondan como usuarios de foros clasicos, con su jerga y tono, para estudios sociolinguisticos o pruebas de sistemas de moderacion.
- Correccion de premisas en sistemas de preguntas y respuestas: su capacidad para detectar y corregir afirmaciones falsas del usuario lo hace adecuado como componente de verificacion en pipelines de QA en portugues.
- Entrenamiento de modelos mas grandes: al ser un modelo pequeno y abierto (licencia WTFPL), puede usarse para generar datos sinteticos de estilo conversacional brasileño que alimenten el ajuste de modelos mayores.
- Educacion y divulgacion sobre modelos de lenguaje: su tamano reducido (870M) y su entrenamiento desde cero en una TPU gratuita lo convierten en un caso de estudio reproducible para cursos de NLP y talleres de fine-tuning.
- Prototipado de asistentes conversacionales informales: para aplicaciones donde se busca un tono desenfadado y sin restricciones de seguridad, como chatbots de entretenimiento o experimentos artisticos, siempre que el usuario acepte la ausencia de filtros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona una evaluacion propia con una bateria de 14 preguntas con gabarito, 5 rondas y temperatura 0.7:

| Metrica | Resultado |
|---|---|
| Aciertos sobre gabarito | 9,8/14 (70 %) |
| Vuelta al modo base | 1 en 160 gatillos |
| Operaciones aritmeticas acertadas | 2/36 |
| Operaciones aritmeticas: admitio no saber | 18/36 |
| Operaciones aritmeticas: chuto mal | 16/36 |

El modelo destaca en admitir desconocimiento, no inventar entidades, mantener la identidad bajo presion, corregir premisas falsas y traducir. Su rendimiento aritmetico es muy bajo (2/36 aciertos), atribuido a la tokenizacion inconsistente de numeros.

## Requisitos de hardware

- VRAM estimada: con 870M parametros en bfloat16 se necesitan aproximadamente 1,7 GB de memoria para los pesos, mas overhead de activaciones y cache. En cuantizacion de 4 bits, unos 0,5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente. Una RTX 3060, RTX 4060 o similar puede ejecutarlo sin problemas. Tambien funciona en CPU con llama.cpp u Ollama, aunque con mayor latencia.
- Compatibilidad con consumer GPU: si, es un modelo pequeno que cabe en practicamente cualquier GPU moderna.
- Opciones de despliegue: transformers (HuggingFace), Text Generation Inference (TGI), vLLM, llama.cpp, Ollama. Nota: en transformers es obligatorio pasar `use_cache=False` en `generate()` por el bug de `qwen3_next`.
- Latencia y throughput: no se han publicado datos oficiales. Como referencia, un modelo de 870M en una GPU moderna genera decenas de tokens por segundo; en CPU, entre 5 y 15 tokens por segundo dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Registro | Disponibilidad |
|---|---|---|---|---|---|
| Echoes-1.5-Instruct-PT-BR | 870M | 4096 | WTFPL | Foro brasileño años 2000 | HuggingFace |
| Echoes-1-Instruct-PT-BR | 536,5M | 4096 | WTFPL | Foro brasileño años 2000 | HuggingFace |
| Echoes-1-Base-PT-BR | 536,5M | 4096 | WTFPL | Base, sin instruccion | HuggingFace |

La comparativa se limita a las generaciones anteriores del mismo autor, ya que no se dispone de datos de otros modelos pequenos en portugues brasileño con caracteristicas equivalentes. La generacion 1.5 duplica aproximadamente el tamano de la 1 (870M frente a 536M) y anade el ajuste de instruccion sobre el base 1.5.

## Limitaciones y advertencias

- Rendimiento aritmetico muy deficiente: solo 2 aciertos en 36 operaciones. La causa es la tokenizacion inconsistente de numeros (por ejemplo, `847` se divide en `['8','47']`), que impide aprender el algoritmo. El SFT logro que el modelo admita su incapacidad en lugar de chutar, pero no que calcule correctamente.
- Errores facticos con confianza: el modelo puede afirmar hechos incorrectos con seguridad, aunque con menor frecuencia que el modelo base.
- Sin alineamiento de seguridad: no ha recibido entrenamiento de recusa. Emite opiniones fuertes, usa gíria y lenguaje pesado de forma natural, ya que es el registro objetivo. No es adecuado para aplicaciones que requieran moderacion o filtros de contenido.
- Contexto corto: 4096 posiciones, entrenado en 2048, lo que limita tareas que requieren ventanas largas.
- Sin memoria entre sesiones: el modelo no recuerda conversaciones anteriores y es consciente de ello; si se le pregunta que dijo el usuario ayer, responde que no lo recuerda.
- Requiere configuracion especifica: es imprescindible usar las stop strings `</s>` y `\nPessoa 1:` para evitar que el modelo continue con el turno del usuario. Tambien es obligatorio `use_cache=False` en transformers, lo que puede afectar al rendimiento en despliegues de alta concurrencia.
- Idioma limitado: solo portugues de Brasil; no se ha evaluado su rendimiento en otros idiomas.
- Licencia WTFPL: permite cualquier uso, incluido comercial, pero sin garantias ni responsabilidad del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/henriqueimoveis/Echoes-1.5-Instruct-PT-BR
- Modelo base: https://huggingface.co/henriqueimoveis/Echoes-1.5-Base-PT-BR
- Generacion anterior (Instruct 1): https://huggingface.co/henriqueimoveis/Echoes-1-Instruct-PT-BR
- Generacion anterior (Base 1): https://huggingface.co/henriqueimoveis/Echoes-1-Base-PT-BR
- Referencia de despliegue en FriendliAI (para Echoes-1-Instruct): https://friendli.ai/models/henriqueimoveis/Echoes-1-Instruct-PT-BR
- Entrada en llm-explorer (para Echoes-1-Base): https://llm-explorer.com/model/henriqueimoveis%2FEchoes-1-Base-PT-BR,1whAYeqr70W6ED2jJ9A6zi
