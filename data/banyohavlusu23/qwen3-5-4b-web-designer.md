# banyohavlusu23/Qwen3.5-4B-Web-Designer

## Resumen

Qwen3.5-4B-Web-Designer es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario banyohavlusu23 en Hugging Face. Su proposito es convertir una peticion en lenguaje natural ("una landing page para mi cafeteria", "un pequeno juego de carreras en el navegador") en una unica pagina HTML autocontenida, con diseno tematico, textos reales, CSS y JavaScript en un solo archivo. El modelo piensa brevemente antes de escribir y esta pensado para ejecutarse en un portatil.

El ajuste se realizo mediante QLoRA (rango 16, alpha 32) sobre 1.443 ejemplos de peticion-a-pagina, generados por DeepSeek V4.1 Flash a partir de prompts reales del arena WebDev de LMArena y propios del autor. El modelo resultante se distribuye tanto en pesos fusionados bf16 (safetensors) como en cuantizaciones GGUF Q4_K_M y Q8_0 para llama.cpp.

Es relevante porque demuestra que un modelo de 4B parametros, ajustado con un conjunto de datos pequeno y curado por calidad (solo se conservaron paginas que funcionaban en navegador), puede mejorar de forma medible la tasa de exito en generacion de paginas web completas: del 35% al 53% de paginas funcionales sobre el modelo base en la misma bateria de 74 prompts.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; detalles no disponibles) |
| Parametros totales | 4B (heredados del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 10.240 tokens en la configuracion de llama-server recomendada (contexto nativo del base no disponible) |
| Tipos de cuantizacion | Q4_K_M (2,7 GB), Q8_0 (4,5 GB); pesos bf16 fusionados |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16 fusionado) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer de 4.000 millones de parametros, y se ajusta mediante QLoRA con rango 16 y alpha 32, durante 2 epocas, con secuencias de 4.096 tokens, sobre una unica GPU RTX 4060 Laptop de 8 GB de VRAM. Posteriormente el adaptador se fusiona en los pesos base. El conjunto de entrenamiento consta de 1.443 ejemplos de peticion-a-pagina: peticiones reales de diseno web procedentes del arena WebDev de LMArena y propias del autor, cada una respondida por DeepSeek V4.1 Flash con un breve plan de diseno y una pagina HTML completa.

La innovacion principal esta en el filtrado del dataset: cada pagina generada se abrio en un navegador y solo se conservo si funcionaba, lo que orienta el ajuste hacia codigo HTML/CSS/JS ejecutable y no solo plausible. El modelo conserva el comportamiento de "pensar antes de escribir" del base, pero lo reduce: la mediana de tokens de razonamiento baja de 657 a 414, lo que acorta la latencia y deja mas presupuesto de tokens para la pagina. La salida esperada es un plan corto seguido de un unico bloque ```html.

## Capacidades

- Generacion de paginas HTML autocontenidas (HTML + CSS + JavaScript en un solo archivo).
- Diseno web tematico: tipografia, espacios en blanco, degradados, animaciones y textos de relleno coherentes con la peticion.
- Razonamiento breve previo a la generacion (plan de diseno corto).
- Soporte de frameworks y recursos externos via CDN (Tailwind, Google Fonts).
- Generacion de pequenos juegos e interactividad en JavaScript.
- Capacidades multilingues: solo se declara ingles (en).
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Prototipado rapido de landing pages: a partir de una descripcion textual se obtiene un `page.html` listo para abrir en el navegador, util para validar una idea de diseno en segundos sin escribir CSS.
- Generacion de maquetas para clientes: agencias o freelancers pueden producir variantes de una pagina (cafeteria, estudio, producto) y presentarlas como propuesta inicial antes del desarrollo real.
- Creacion de paginas de aterrizaje para campanas: el modelo genera textos y estructura orientados a conversion, con secciones y llamadas a la accion, adecuado para pruebas A/B tempranas.
- Desarrollo de pequenos juegos web: peticiones como "un juego de carreras en el navegador" producen un HTML con logica JavaScript funcional, util para demos y material educativo.
- Material didactico de frontend: sirve como generador de ejemplos de HTML/CSS/JS para cursos, ya que entrega codigo completo y ejecutable en un unico archivo.
- Generacion local en portatil: con el GGUF Q4_K_M (2,7 GB) se puede ejecutar en un equipo de consumo sin conexion, lo que facilita su uso en entornos con privacidad o sin GPU dedicada.
- Iteracion rapida en herramientas tipo IDE o chat: integrado en LM Studio u Ollama, permite refinar una pagina conversando, aprovechando el contexto de 10.240 tokens configurado.

## Benchmarks y rendimiento

Evaluacion del autor sobre 74 prompts no vistos en entrenamiento, 2 paginas por prompt (148 paginas), con el GGUF Q4_K_M, abriendo cada pagina en navegador y considerandola funcional si termina, carga, no lanza errores de JavaScript y sus botones responden.

| Metrica | Qwen3.5-4B (base) | Qwen3.5-4B-Web-Designer |
|---|---|---|
| Paginas funcionales | 52/148 (35%) | 78/148 (53%) |
| Paginas terminadas | 111/148 (75%) | 141/148 (95%) |
| Tokens de razonamiento (mediana) | 657 | 414 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3 GB para Q4_K_M (2,7 GB de pesos) y unos 5 GB para Q8_0 (4,5 GB de pesos), mas overhead de contexto.
- Pesos bf16 fusionados: en torno a 8 GB, requiere GPU con al menos 8-10 GB o ejecucion en CPU.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (el autor entreno en una RTX 4060 Laptop de 8 GB); para mayor throughput, RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, en tarjetas de 8 GB o mas con Q4_K_M; tambien en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio, Ollama; pesos safetensors para Transformers.
- Configuracion recomendada: `llama-server -m Qwen3.5-4B-Web-Designer-Q4_K_M.gguf --jinja -c 10240 -ngl 99`, temperatura 0,7, top-p 0,95, top-k 20, hasta 8.192 tokens nuevos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Web-Designer | 4B | 10.240 (config. recomendada) | Generacion de paginas web | Apache-2.0 | Hugging Face (GGUF + safetensors) |
| Qwen3.5-4B (base) | 4B | no disponible | Proposito general | Apache-2.0 | Hugging Face |
| DeepSeek V4.1 Flash | no disponible | no disponible | Proposito general (genero el dataset) | no disponible | no disponible |

No se dispone de datos de benchmarks estandar ni de otros ajustes finos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Tasa de exito limitada: un 53% de paginas funcionales implica que cerca de la mitad de las generaciones pueden presentar fallos de JavaScript o interaccion, por lo que requiere revision humana antes de produccion.
- Riesgo de alucinacion en textos, nombres de marca y datos de contacto generados; no deben publicarse sin verificacion.
- Dependencia de CDN externos (Tailwind, Google Fonts): las paginas no son totalmente offline y pueden degradarse sin conexion.
- Modelo no oficial, no afiliado a Qwen ni a Alibaba Cloud; el soporte y mantenimiento dependen del autor.
- El conjunto de datos de prompts (lmarena-ai/arena-webdev-preferences) es CC BY 4.0 y las paginas de entrenamiento fueron generadas por DeepSeek V4.1 Flash; conviene revisar los terminos de dichos recursos para usos derivados.
- Licencia Apache-2.0 permite uso comercial, pero no se ofrecen garantias de calidad ni de seguridad del codigo generado.
- Sin datos publicados sobre sesgos, robustez ante prompts adversarios ni evaluaciones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/banyohavlusu23/Qwen3.5-4B-Web-Designer
- Galeria de paginas generadas: https://huggingface.co/spaces/banyohavlusu23/Qwen3.5-4B-Web-Designer-Gallery
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de prompts: https://huggingface.co/datasets/lmarena-ai/arena-webdev-preferences
