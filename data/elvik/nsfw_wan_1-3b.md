# elvik/NSFW_Wan_1.3b

# elvik/NSFW_Wan_1.3b

## Resumen
elvik/NSFW_Wan_1.3b es un ajuste fino (fine-tune) del modelo de generacion de video texto-a-video Wan2.1-T2V-1.3B, desarrollado originalmente por el equipo Wan-AI de Alibaba. El autor del ajuste es el usuario de HuggingFace "elvik", y el modelo esta especializado en la generacion de contenido audiovisual para adultos (NSFW). Hereda del modelo base su arquitectura de transformer de difusion y su tamano de aproximadamente 1.300 millones de parametros.

El problema que resuelve es la adaptacion de un modelo generativo de video de proposito general a un dominio concreto: la sintesis de clips de video de tematica adulta a partir de descripciones textuales. Dado que los modelos de video abiertos suelen distribuirse con alineaciones que limitan este tipo de contenido, los ajustes especificos como este cubren una demanda que el modelo base no atiende de forma directa.

Es relevante en el ecosistema actual porque demuestra la flexibilidad de los modelos de difusion de video de 1.3B parametros para ser reentrenados en dominios especificos, replicando la dinamica que ya se observo con los modelos de imagen (Stable Diffusion y sus derivados). El acceso al repositorio esta restringido (gated): requiere aceptar condiciones en HuggingFace antes de la descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT), heredada del modelo base Wan2.1-T2V-1.3B |
| Parametros totales | ~1.300 millones (1.3B, segun el identificador del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de generacion de video, no text-to-text) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | no disponible (no confirmado en la informacion proporcionada) |

Otros datos del repositorio: tamano de 105,4 GB, 0 descargas, 0 likes, creado y actualizado el 2 de octubre de 2026, acceso restringido (gated) y etiqueta "not-for-all-audiences".

## Arquitectura y entrenamiento
La arquitectura del modelo es la del transformer de difusion (DiT) de Wan2.1, compuesta por un VAE de alta compresion (Wan-VAE), un codificador de texto y un backbone de difusion que opera en el espacio latente del VAE. El modelo base Wan2.1-T2V-1.3B genera video de resolucion 480P y esta disenado para poder ejecutarse en GPUs de consumo gracias a su reducido numero de parametros en comparacion con la variante de 14B de la misma familia.

No se dispone de informacion sobre el procedimiento de entrenamiento especifico de este ajuste: se desconoce el numero de tokens o clips utilizado, la composicion exacta del dataset NSFW empleado, y si se aplicaron tecnicas de ajuste como LoRA, DreamBooth o un fine-tune completo. Tampoco hay datos publicos sobre si se empleo RLHF, DPO u otro metodo de alineacion. Toda la informacion tecnica de la que se dispone deriva del modelo base heredado.

## Capacidades
- Generacion de video texto-a-video: produce clips a partir de una descripcion textual en lenguaje natural.
- Contenido para adultos (NSFW): especializado en escenas y tematicas de caracter explicito, que el modelo base no genera por sus alineaciones.
- Resolucion 480P heredada del modelo base Wan2.1-T2V-1.3B.
- Generacion de video de corta duracion (el modelo base Wan2.1 opera con secuencias de aproximadamente 5 segundos a 16 fps, dato del modelo base).
- No se ha confirmado soporte de tool calling, function calling, modo agente, razonamiento multi-paso ni otras capacidades propias de modelos de lenguaje: se trata de un modelo generativo de video.
- Idiomas soportados para los prompts de texto: no disponible.

## Casos de uso
- Produccion de contenido para plataformas de entretenimiento para adultos: el modelo permite generar clips originales a partir de guiones o descripciones textuales, reduciendo la necesidad de rodaje fisico en determinados formatos.
- Prototipado rapido de storyboards para publicaciones de tematica adulta: permite previsualizar escenas y composiciones antes de una produccion real.
- Investigacion sobre generacion de video de dominio especifico: util para estudiar como los modelos de difusion de video responden al fine-tuning en dominios restringidos y como se comportan las alineaciones de seguridad.
- Creacion artistica y experimental: artistas que trabajan con tematicas de desnudo o erotismo pueden emplearlo como herramienta generativa dentro de un flujo de trabajo creativo.
- Generacion de material para animacion de personajes: al ser texto-a-video, permite animar descripciones de personajes en movimiento.
- Pruebas de contenido sintetico para moderacion: equipos que desarrollan sistemas de deteccion de contenido explicito pueden usarlo como fuente controlada de ejemplos generados por IA.
- Demostraciones tecnicas de fine-tuning sobre Wan2.1: sirve como referencia de como adaptar el modelo base de 1.3B a un dominio vertical.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- El repositorio ocupa 105,4 GB, un tamano muy superior al de un checkpoint de 1.3B en una sola precision, lo que sugiere que puede contener multiples versiones de pesos, estados de optimizador o checkpoints intermedios. No se ha confirmado su contenido exacto.
- El modelo base Wan2.1-T2V-1.3B fue presentado por sus desarrolladores como ejecutable en GPUs de consumo con aproximadamente 8,19 GB de VRAM, cifra publica del modelo base y no confirmada para este ajuste.
- GPU recomendadas: no disponible de forma especifica para este ajuste; por herencia del base, tarjetas como la RTX 4090 (24 GB) o superiores permiten su ejecucion, mientras que A100 o H100 no son necesarias para un modelo de 1.3B.
- Opciones de despliegue: no disponibles en la informacion proporcionada. El modelo base Wan2.1 suele desplegarse con el repositorio oficial de referencia de Wan-AI, pero no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI para este ajuste.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| elvik/NSFW_Wan_1.3b | ~1.3B | no disponible | CreativeML OpenRAIL-M | Gated, acceso restringido |
| Wan-AI/Wan2.1-T2V-1.3B (base) | 1.3B | 480P | Apache 2.0 | Publico |
| Wan-AI/Wan2.1-T2V-14B | 14B | 480P / 720P | Apache 2.0 | Publico |
| Otras alternativas abiertas de generacion de video (CogVideoX, LTX-Video, HunyuanVideo) | no disponible | no disponible | no disponible | no disponible |

La comparacion directa mas relevante es contra el modelo base: este ajuste modifica el comportamiento para permitir contenido NSFW, cambia la licencia de Apache 2.0 a CreativeML OpenRAIL-M y restringe el acceso. No se dispone de datos de rendimiento comparado entre ambos.

## Limitaciones y advertencias
- Sesgos conocidos: no disponibles de forma especifica, pero el modelo hereda los sesgos del dataset de entrenamiento del base y, adicionalmente, los del dataset NSFW utilizado en el ajuste, del que no se dispone informacion.
- Riesgo de alucinacion: como todo modelo generativo de video, puede producir artefactos visuales, incoherencias temporales entre fotogramas e inconsistencias anatomicas.
- Limitaciones de contexto o idioma: no se ha confirmado que idiomas acepta el codificador de texto para los prompts.
- Restricciones de licencia: la licencia CreativeML OpenRAIL-M impone condiciones de uso, entre ellas restricciones sobre determinados usos y la obligacion de incluir la misma licencia en obras derivadas. Es necesario revisar sus clausulas antes de cualquier explotacion comercial.
- Acceso restringido: el modelo es "gated" y esta marcado como "not-for-all-audiences"; requiere aceptar condiciones y probablemente verificar la mayoria de edad.
- Contenido para adultos: la generacion y difusion de contenido NSFW esta sujeta a la legislacion de cada pais. Es responsabilidad del usuario verificar el cumplimiento legal, especialmente en lo relativo a la representacion de personas, la verificacion de edad y los derechos de imagen.
- Advertencia de produccion: sin datos publicados sobre calidad, estabilidad o tasa de exito, no se recomienda su integracion en un pipeline de produccion sin una evaluacion previa exhaustiva.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso ni de validacion por parte de la comunidad.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/elvik/NSFW_Wan_1.3b
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
