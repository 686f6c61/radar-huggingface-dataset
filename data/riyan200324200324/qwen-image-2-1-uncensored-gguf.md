# Riyan200324200324/Qwen-Image-2.1-Uncensored-GGUF

# Qwen-Image-2.1 Uncensored GGUF

## Resumen

Qwen-Image-2.1 Uncensored GGUF es un conjunto de cuantizaciones en formato GGUF del modelo de difusion Qwen/Qwen-Image-2.1, un modelo unificado de generacion de imagenes a partir de texto y de edicion de imagenes desarrollado por el equipo Qwen (Alibaba). El repositorio lo publica el usuario Riyan200324200324 y su proposito es permitir la inferencia local del modelo en ComfyUI mediante el nodo GGUF, reduciendo los requisitos de memoria respecto a los pesos originales en BF16.

El componente de generacion visual del modelo base tiene 7.115.124.736 parametros (aproximadamente 7,1 mil millones) distribuidos en 32 capas Single-Stream DiT (Diffusion Transformer). El repositorio incluye ademas los ficheros complementarios necesarios para el pipeline completo: un codificador de texto Qwen3-VL 8B (en BF16 o en Int8 con rotacion de convolucion) y un VAE en BF16 de 676 MB. El tamano total del repositorio es de 69,2 GB, ya que aloja todas las cuantizaciones y los ficheros auxiliares.

Su relevancia actual radica en que acerca un modelo de generacion de imagenes de 7B a hardware de consumo: la cuantizacion Q4_K_M ocupa 4,60 GB y, combinada con el codificador de texto en RAM del sistema, permite generar imagenes en GPUs con 8-12 GB de VRAM. La etiqueta "uncensored" hace referencia a que, segun las fuentes consultadas, se distribuyen los pesos originales del modelo base sin modificaciones ni capas adicionales de filtrado, no a un reentrenamiento especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT), 32 capas Single-Stream; modelo unificado de texto-a-imagen y edicion de imagen |
| Parametros totales | 7.115.124.736 (componente de generacion visual) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 (en variante "UC" y en variante sin etiquetar) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (license: other) |
| Formato de pesos | GGUF (modelo de difusion); safetensors para el codificador de texto y el VAE |
| Codificador de texto | Qwen3-VL 8B, en BF16 (17,53 GB) o Int8 con rotacion de convolucion (9,35 GB) |
| VAE | qwen_image_2.1_vae_bf16.safetensors (676 MB) |
| Pipeline | text-to-image (con soporte de flujo de edicion de imagen) |
| Modelo base | Qwen/Qwen-Image-2.1 (relacion: quantized) |
| Tamano del repositorio | 69,2 GB |
| Fecha de publicacion | 2026-09-27 |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1 es un Diffusion Transformer unificado que cubre tanto la generacion de imagenes desde texto como la edicion de imagenes. El componente de generacion visual cuenta con 7.115.124.736 parametros repartidos en 32 capas Single-Stream DiT, lo que lo situa en la gama de 7B. La companyia de Qwen destaca cuatro mejoras en esta version respecto a iteraciones anteriores: una arquitectura mas compacta y eficiente, y un enfoque que equilibra calidad de generacion, coste de inferencia y versatilidad. El texto se codifica mediante Qwen3-VL 8B, un modelo de vision-lenguaje, y la imagen latente se decodifica con un VAE especifico del modelo.

Esta publicacion concreta no aporta informacion sobre el proceso de entrenamiento: no se detalla el numero de tokens o de pares imagen-texto utilizados, la composicion del dataset, ni si se emplearon tecnicas de ajuste por preferencias humanas o de refuerzo. La model card tampoco documenta innovaciones de inferencia como decodificacion especulativa o atencion lineal, ni incluye la ficha de los pesos originales. El trabajo de este repositorio se limita a la conversion y cuantizacion de los pesos upstream al formato GGUF, junto con la redistribucion de los ficheros complementarios. Tampoco se especifica que herramienta o version de cuantizacion se ha utilizado.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image), con soporte de prompts detallados.
- Edicion de imagenes: el ecosistema del modelo incluye un flujo de trabajo especifico de edicion de imagen, disponible en las plantillas oficiales de Comfy-Org.
- Integracion nativa en ComfyUI mediante el nodo Unet Loader (GGUF) y el nodo CLIPLoader con tipo qwen_image.
- Ejecucion completamente local: no requiere llamadas a APIs externas una vez descargados los ficheros de modelo, codificador y VAE.
- Carga selectiva por cuantizacion: se puede elegir entre seis niveles de precision (de BF16 a Q4_0) segun la VRAM disponible.
- Codificacion de prompts mediante Qwen3-VL 8B, un codificador de vision-lenguaje multimodal; la ficha no especifica la lista de idiomas soportados.
- No dispone de tool calling ni de function calling: no es un modelo de lenguaje conversacional.
- No dispone de modo de razonamiento explicito (thinking mode), ni de capacidades de agente o de razonamiento multi-paso en texto.
- No procesa audio ni genera salidas multimodales distintas de la imagen.

## Casos de uso

- Generacion de imagenes en local sin conexion: con la cuantizacion Q4_K_M (4,60 GB) y el codificador de texto en RAM del sistema, un equipo con GPU de 8-12 GB de VRAM puede ejecutar el pipeline completo en ComfyUI sin enviar prompts a servicios externos.
- Edicion de imagenes sobre una imagen de entrada: el repositorio remite al flujo de trabajo oficial de edicion de Qwen-Image 2.1, de modo que se puede sustituir el nodo UNETLoader por Unet Loader (GGUF) y reutilizar la misma logica de trabajo.
- Prototipado rapido de recursos graficos para desarrollo de producto: ilustraciones de concepto, iconos, fondos y bocetos generados de forma iterativa dentro del propio equipo de diseno, sin coste por llamada de API.
- Ahorro de VRAM en estaciones de trabajo modestas: la recomendacion de mantener el modelo de difusion en VRAM y descargar el codificador de texto a RAM (9,35 GB en Int8) permite reservar la memoria de GPU para el muestreo, que es la fase donde la velocidad es critica.
- Investigacion sobre seguridad y alineacion de modelos generativos: al distribuir los pesos del modelo base sin filtros adicionales, el repositorio puede utilizarse en entornos controlados para estudiar el comportamiento del modelo ante prompts que otros despliegues rechazarian.
- Despliegue en equipos con memoria unificada: en sistemas Apple Silicon, el uso conjunto del modelo cuantizado y del codificador de texto en memoria unificada evita las limitaciones de VRAM de una GPU discreta.
- Comparacion de precisiones de cuantizacion: el repositorio incluye seis niveles de cuantizacion del mismo modelo, lo que permite medir de forma controlada la perdida de calidad frente al ahorro de memoria en un mismo hardware.
- Flujos de generacion por lotes en local: con la cuantizacion Q4_K_M en VRAM, es viable encadenar generaciones sucesivas dentro de un pipeline automatizado de ComfyUI para producir variaciones de un mismo concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye una imagen de referencia denominada `Qwen-Image-2.1-Benchmark.png`, pero no se proporciona la tabla de valores asociada ni los modelos con los que se compara. No se dispone tampoco de medidas de latencia, throughput ni de calidad (FID, CLIP score u otras) para ninguna de las cuantizaciones.

## Requisitos de hardware

- Modelo de difusion en VRAM (pesos unicamente, sin contar activaciones ni el codificador): BF16 14,23 GB; Q8_0 7,59 GB; Q6_K 5,88 GB; Q5_K_M 5,22 GB; Q4_K_M 4,60 GB; Q4_0 4,15 GB.
- Codificador de texto: 17,53 GB en BF16 o 9,35 GB en Int8 (recomendado). Puede residir en RAM del sistema y descargarse a CPU, ya que solo se ejecuta una vez por prompt.
- Configuracion recomendada por el autor: Q4_K_M (~4,60 GB en VRAM) junto con qwen3vl_8b_int8_convrot.safetensors (~9,35 GB en RAM). Esta combinacion ahorra entre 9 y 17 GB de VRAM con un impacto practicamente nulo en la velocidad de generacion.
- Cabe en GPU de consumo: la configuracion recomendada es viable en tarjetas de 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) siempre que el codificador de texto se mantenga en RAM. Las cuantizaciones BF16 y Q8_0 del modelo de difusion, con el codificador en GPU, requieren tarjetas de gama alta o profesional (24 GB o mas).
- GPU profesionales: las cuantizaciones de mayor precision y la ejecucion completa en GPU sin descarga a CPU son propias de A100, H100 o equivalentes.
- Opciones de despliegue: ComfyUI junto con el fork mantenido ComfyUI-GGUF de leejet, que soporta de forma nativa la arquitectura Qwen-Image 2.1. El fork antiguo city96/ComfyUI-GGUF puede devolver el error "Unknown model architecture!".
- Alternativa de memoria unificada: sistemas Apple Silicon con RAM suficiente para alojar simultaneamente el modelo cuantizado y el codificador de texto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento verificados en la informacion proporcionada para establecer una comparacion cuantitativa fiable. La tabla siguiente recoge unicamente los aspectos estructurales confirmados.

| Modelo | Parametros | Contexto / prompt | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1 (base, BF16) | 7,1B (32 capas DiT) | no disponible | safetensors en BF16 | qwen-research | HuggingFace (Qwen/Qwen-Image-2.1) |
| Este repositorio (Uncensored GGUF) | 7,1B (derivado del anterior) | no disponible | GGUF: BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 | qwen-research | HuggingFace (Riyan200324200324) |
| Otras redistribuciones GGUF del mismo modelo | 7,1B | no disponible | GGUF | qwen-research | HuggingFace (abenzerps, KasugaiSakura) |
| Alternativas del mismo segmento (p. ej. FLUX.1-dev, SD 3.5 Large) | no verificado en la informacion disponible | no disponible | no disponible | no disponible | no disponible |

Conviene tener en cuenta que las tres primeras filas corresponden al mismo modelo subyacente con distintos empaquetados o repositorios de publicacion; su diferencia practica esta en la disponibilidad de ficheros, los nombres y los enlaces, no en los pesos. La model card de este repositorio enlaza a rutas del usuario `abenzerps`, mientras que la busqueda web localiza un repositorio equivalente bajo el usuario `KasugaiSakura`, lo que sugiere redistribuciones sucesivas del mismo trabajo.

## Limitaciones y advertencias

- Sesgos conocidos: la informacion disponible no documenta una evaluacion de sesgos del modelo base ni de estas cuantizaciones.
- Riesgo de alucinacion: como modelo generativo de imagenes, puede producir contenido visual incoherente, anatomias incorrectas, texto ilegible dentro de la imagen o elementos que no aparecen en el prompt. No se han publicado metricas de fidelidad al prompt para estas cuantizaciones.
- La etiqueta "uncensored" no implica un reentrenamiento: segun las fuentes consultadas, los ficheros corresponden a los pesos originales del modelo sin modificaciones. El termino describe la ausencia de filtros anadidos, no una capacidad adicional del modelo.
- El contenido generado sin filtros puede incluir material inapropiado, ofensivo o ilegal en determinadas jurisdicciones. El responsable del despliegue debe establecer sus propias salvaguardas.
- Licencia: se trata de la licencia qwen-research, no de una licencia permisiva. Cualquier uso comercial debe revisarse contra los terminos publicados por el titular, ya que no se trata de Apache 2.0 ni de MIT.
- Restricciones de uso: la combinacion de una licencia de investigacion con la redistribucion de pesos sin filtros limita el uso en entornos de produccion regulados.
- Limitaciones de idioma: la model card no publica la lista de idiomas soportados por el codificador de texto ni por el pipeline de generacion.
- Perdida de calidad por cuantizacion: no se aportan mediciones del impacto de cada nivel de cuantizacion (de BF16 a Q4_0) sobre la calidad de imagen; Q4_K_M se presenta como el equilibrio recomendado sin datos que lo respalden.
- Dependencia de un fork concreto: el autor advierte que la version antigua de ComfyUI-GGUF (city96) falla con esta arquitectura y remite al fork de leejet, lo que anade una dependencia de mantenimiento externo.
- Madurez del repositorio: cuenta con 0 descargas y 0 me gusta en el momento de la consulta, y no hay validacion de la comunidad sobre la integridad de los ficheros publicados.
- Ausencia de informacion de entrenamiento: no se documentan datos de entrenamiento, licencias del dataset original ni proceso de alineacion, lo que dificulta la trazabilidad para uso institucional.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Riyan200324200324/Qwen-Image-2.1-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio oficial en GitHub: https://github.com/QwenLM/Qwen-Image-2.1
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork mantenido, soporte nativo de Qwen-Image 2.1): https://github.com/leejet/ComfyUI-GGUF
- ComfyUI-GGUF (fork anterior, puede fallar con esta arquitectura): https://github.com/city96/ComfyUI-GGUF
- Plantilla de flujo texto-a-imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_t2i.json
- Plantilla de flujo de edicion de imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_image_edit.json
- Redistribucion alternativa del mismo trabajo (KasugaiSakura): https://huggingface.co/KasugaiSakura/Qwen-Image-2.1-Uncensored-GGUF
- Analisis sobre el caracter "uncensored" del modelo: https://stashbase.ai/blog/run-qwen-image-2-1-locally-uncensored/
- Guia de ejecucion en ComfyUI con GGUF y codificador Heretic: https://hoangyell.com/qwen-image-2-1-uncensored-comfyui/
