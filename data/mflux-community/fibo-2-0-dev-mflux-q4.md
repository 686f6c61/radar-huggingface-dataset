# mflux-community/fibo-2-0-dev-mflux-q4

## Resumen
Fibo-2.0-dev MFlux Q4 es una conversion comunitaria del modelo de generacion de imagenes Fibo-2.0-dev de Bria AI, empaquetada en formato MLX y cuantizada a 4 bits para su ejecucion nativa en Apple Silicon. No se trata de un modelo nuevo, sino de una redistribucion optimizada del checkpoint original: los pesos han sido convertidos con MFlux 0.23.0 el 25 de octubre de 2026 y unicamente se han modificado mediante conversion a MLX y cuantizacion, manteniendo intacta la licencia del autor original.

El modelo resuelve un problema practico: ejecutar localmente un modelo de text-to-image de ultima generacion en un Mac sin depender de servicios en la nube ni de GPUs NVIDIA. Frente a la version BF16 del mismo modelo (25,1 GB), esta variante Q4 ocupa 7,2 GB, lo que la hace viable en equipos con memoria unificada mas modesta. La cuantizacion MLX affine de 4 bits se aplica de forma uniforme al text encoder, al transformer y al VAE, y el nivel de cuantizacion queda almacenado en los propios pesos.

Es relevante ahora porque amplia el acceso a modelos generativos de imagen de alta calidad dentro del ecosistema Apple, con una integracion directa en la herramienta de linea de comandos mflux-generate-fibo2. La ficha se centra en esta conversion; los detalles de arquitectura y entrenamiento del modelo base no estan documentados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de difusion text-to-image; detalles no documentados en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no aplica (modelo text-to-image; no se especifica longitud de prompt) |
| Tipos de cuantizacion | Q4 (MLX affine quantization de 4 bits en text encoder, transformer y VAE); existen variantes BF16, Q8, Q6, Q5 y Q3 |
| Idiomas soportados | no disponible |
| Licencia | fibo-2.0-dev-license (hereda la del modelo original briaai/Fibo-2.0-dev) |
| Formato de pesos | safetensors en formato MLX (repo de 7,2 GB) |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna del modelo base Fibo-2.0-dev ni su proceso de entrenamiento. Lo unico documentado es que se trata de un modelo de difusion text-to-image cuyo checkpoint ha sido convertido a MLX y cuantizado con MFlux 0.23.0. La conversion aplica cuantizacion affine de 4 bits de MLX sobre tres componentes diferenciados: el text encoder, el transformer y el VAE, y el nivel de cuantizacion se almacena en los pesos, por lo que no es necesario pasar el flag --quantize en tiempo de inferencia.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras optimizaciones. Tampoco se documentan innovaciones tecnicas especificas del modelo original en la model card de esta conversion.

## Capacidades
- Generacion de imagenes a partir de prompts de texto (pipeline text-to-image).
- Ejecucion local nativa en Apple Silicon mediante MLX, sin necesidad de GPU NVIDIA ni servicios en la nube.
- Control de resolucion de salida mediante parametros de anchura y altura (el ejemplo oficial usa 1024x1024).
- Reproducibilidad mediante semilla fija (--seed).
- Inferencia con pesos cuantizados a 4 bits sin flag adicional de cuantizacion.
- No se documentan capacidades de tool calling, agentes, vision inversa, audio ni modos de razonamiento extendido.

## Casos de uso
- Generacion de ilustraciones para prototipado de producto: un disenador puede lanzar prompts desde la terminal en un Mac y obtener imagenes de 1024x1024 en segundos, integrando el flujo en scripts de iteracion rapida sin coste por API.
- Creacion de assets para blogs y documentacion tecnica: la cuantizacion Q4 permite generar imagenes de portada localmente en un portatil Apple Silicon, evitando subir contenido a servicios externos.
- Exploracion artistica y conceptual: el control de semilla y resolucion permite reproducir y variar resultados de forma determinista, util para sesiones de brainstorming visual.
- Automatizacion de pipelines de contenido: al ser una CLI invocable (mflux-generate-fibo2), puede encadenarse en scripts de CI o cron para generar lotes de imagenes a partir de plantillas de prompt.
- Desarrollo y evaluacion de herramientas de generacion de imagen: investigadores pueden comparar la calidad de la variante Q4 frente a Q8 o BF16 en el mismo hardware para estudiar el impacto de la cuantizacion.
- Demos locales y talleres: al ocupar 7,2 GB y no requerir conectividad, es adecuado para entornos docentes o de demostracion en equipos Mac sin infraestructura GPU.
- Uso offline en entornos con restricciones de privacidad: la inferencia local evita enviar prompts o imagenes a terceros, relevante en sectores regulados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad (FID, CLIP score u otras) ni comparaciones cuantitativas entre las distintas variantes de cuantizacion.

## Requisitos de hardware
- Memoria: el repo Q4 ocupa 7,2 GB, por lo que se recomienda al menos 8-16 GB de memoria unificada libre para cargar pesos y ejecutar la inferencia con margen.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con soporte MLX.
- No esta disenado para GPUs NVIDIA ni CUDA; requiere el stack MLX de Apple.
- Opciones de cuantizacion para ajustar memoria: BF16 (25,1 GB), Q8 (13,4 GB), Q6 (10,3 GB), Q5 (8,8 GB), Q4 (7,2 GB) y Q3 (5,6 GB).
- Despliegue: CLI mflux-generate-fibo2, instalable con `uv tool install --upgrade mflux`; tambien es posible descargar los pesos con `hf download` y pasar una ruta local con --model.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fibo-2-0-dev-mflux-q4 (este) | no disponible | no aplica | MLX safetensors Q4, 7,2 GB | fibo-2.0-dev-license | Hugging Face, 69 descargas |
| fibo-2-0-dev-mflux-q8 | no disponible | no aplica | MLX safetensors Q8, 13,4 GB | fibo-2.0-dev-license | Hugging Face |
| fibo-2-0-dev-mflux-bf16 | no disponible | no aplica | MLX safetensors BF16, 25,1 GB | fibo-2.0-dev-license | Hugging Face |
| briaai/Fibo-2.0-dev (original) | no disponible | no aplica | no disponible | fibo-2.0-dev-license | Hugging Face |

Las variantes Q3 a BF16 del mismo modelo permiten ajustar el equilibrio entre calidad y memoria. No se dispone de datos de rendimiento comparativo entre ellas en la informacion proporcionada.

## Limitaciones y advertencias
- Conversion no oficial: es una conversion comunitaria de MFlux-Community, no un release de los autores originales de Fibo-2.0-dev.
- La cuantizacion a 4 bits puede degradar la calidad de imagen respecto a BF16 o Q8; no se documenta la magnitud de esa perdida.
- Licencia fibo-2.0-dev-license: es necesario revisar los terminos del modelo original en briaai/Fibo-2.0-dev antes de cualquier uso comercial, ya que puede incluir restricciones.
- Solo funciona en Apple Silicon con MLX; no es portable a CUDA ni a otros aceleradores sin reconversion.
- Riesgo de sesgos y alucinaciones visuales inherente a los modelos generativos de imagen; no se documentan evaluaciones de sesgo.
- Idiomas soportados no documentados; se desconoce el rendimiento con prompts en castellano.
- Sin resultados de benchmarks publicados que permitan validar la calidad frente a alternativas.
- El repo tiene solo 69 descargas y 0 likes, lo que indica escasa validacion comunitaria hasta la fecha.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q4
- Modelo base original: https://huggingface.co/briaai/Fibo-2.0-dev
- Variante BF16: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-bf16
- Variante Q8: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q8
- Variante Q6: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q6
- Variante Q5: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q5
- Variante Q3: https://huggingface.co/mflux-community/fibo-2-0-dev-mflux-q3
- Repositorio MFlux: https://github.com/filipstrand/mflux
- Organizacion MFlux-Community: https://huggingface.co/mflux-community
