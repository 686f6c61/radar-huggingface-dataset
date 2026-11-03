# abbuibuibui/YotsugiOnonoki-Lora

## Resumen

YotsugiOnonoki-Lora es un adaptador LoRA de personaje para modelos de difusion SDXL, entrenado por el usuario abbuibuibui sobre el checkpoint waiIllustriousSDXL v17. Reproduce a Yotsugi Ononoki (斧乃木余接), personaje de la serie *Monogatari*, en su variante de diseno formal E1-E7. No es un modelo de lenguaje: es un modulo de pesos que se inyecta en un pipeline de generacion de imagenes mediante la libreria diffusers o ComfyUI.

El adaptador resuelve un problema acotado: fijar la identidad visual de un personaje concreto (cabello blanco en dos coletas, ojos verdes, rostro de muneca y vestido naranja con sombrero caracteristico) sin arrastrar el estilo del dataset de entrenamiento. Para ello se entreno con 53 pares imagen-texto y un rango LoRA de 64 con alpha 32, y el autor publica siete epocas con una evaluacion comparativa que recomienda la epoca E6 a fuerza 0.8.

Su relevancia es practica para quien genere ilustracion anime con la familia Illustrious/SDXL: ofrece un adaptador pequeno (456 MB por fichero), documentado con tokens de activacion y con evaluacion horizontal publica, lo que reduce el ciclo de prueba y error habitual en LoRAs de personaje. El repo completo ocupa 3.2 GB porque incluye todas las epocas y las imagenes de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre difusion latente SDXL (checkpoint base waiIllustriousSDXL v17) |
| Parametros totales | no disponible (rango LoRA 64, alpha 32; fichero de 456.490.692 bytes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen; resolucion de entrenamiento con buckets hasta 1536) |
| Tipos de cuantizacion | no disponible (pesos LoRA en safetensors, precisión de entrenamiento bf16) |
| Idiomas soportados | en, zh (prompts en ingles y chino) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (compatible con diffusers y ComfyUI) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 32 aplicado sobre los bloques de atencion de un UNet SDXL. El checkpoint base es waiIllustriousSDXL v17, un modelo de la familia Illustrious orientado a ilustracion anime, por lo que el LoRA hereda su tokenizador, sus dos text encoders (CLIP-L y CLIP-G) y su VAE. El entrenamiento uso AdamW en bf16, buckets con tope de 1536 y 7 epocas sobre 53 pares imagen-texto (solo el conjunto Orange_Dress) con 3 repeticiones por imagen. El hardware declarado es una NVIDIA DGX Spark con ComfyUI.

Las captions se generaron con `keep_tokens = 2`, lo que explica que el color de pelo y de ojos a menudo se omita en el texto de entrenamiento: el autor advierte que conviene anadirlos en el prompt de inferencia. Se definen dos tokens: `yotsugi_ononoki` para la identidad y `yotsugi_ononoki_orange_dress` para el vestido naranja y el sombrero caracteristico. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo que no aplica a un modelo de difusion.

## Capacidades

- Generacion de imagenes anime del personaje Yotsugi Ononoki en encuadres de retrato, tres cuartos, perfil, cuerpo completo y sentada.
- Control de identidad mediante el token `yotsugi_ononoki`: coletas gemelas blancas, ojos verdes y rostro inexpresivo de muneca.
- Control de vestuario mediante `yotsugi_ononoki_orange_dress`: vestido naranja con volantes por capas, peto con estrella azul, calcetines rayados, botas amarillas y sombrero naranja con ojos saltones.
- Composicion con fondo simple o escena nocturna compleja, segun la evaluacion publicada.
- Funciona sin token de vestuario, generando la identidad sin el atuendo principal (imagen `05_no_outfit`).
- Compatible con prompts en ingles y chino.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o video: es exclusivamente un adaptador de imagen.

## Casos de uso

- Ilustracion de fan art de *Monogatari*: invocando `yotsugi_ononoki` a fuerza 0.8 con el checkpoint waiIllustriousSDXL v17 se obtiene el personaje con su silueta clasica sin necesidad de describir cada rasgo en el prompt.
- Creacion de hojas de personaje para proyectos derivados: combinando los encuadres de retrato, tres cuartos y perfil documentados en la evaluacion se puede construir una referencia visual coherente del personaje.
- Generacion de escenas narrativas: el adaptador mantiene la identidad en composiciones nocturnas y fondos complejos, util para ilustrar escenas de ficcion o portadas de doujinshi.
- Prototipado rapido de variantes de vestuario: al separar identidad y atuendo en dos tokens, se puede mantener el personaje y sustituir la ropa en el prompt para explorar disenos alternativos.
- Integracion en flujos ComfyUI: el safetensors se carga como nodo LoRA estandar, lo que permite encadenarlo con otros LoRAs de estilo o de composicion en un grafo de generacion.
- Evaluacion comparativa de epocas: el repo incluye siete ficheros y material de evaluacion, util para estudiar como varia la fidelidad del personaje segun la epoca y la fuerza del adaptador.
- Docencia sobre entrenamiento de LoRAs: el model card documenta hiperparametros, tokens y metodologia de evaluacion, lo que sirve como caso practico de ajuste fino de SDXL con datasets pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la informacion disponible. El autor aporta una evaluacion cualitativa en dos rondas:

| Ronda | Metodologia | Resultado |
|---|---|---|
| Round 1 | E1-E7 a fuerza 0.8 | Seleccion de candidatas E5, E6 y E7 |
| Round 3 | E5/E6/E7 x 10 escenas x 4 fuerzas (0.4, 0.6, 0.8, 1.0) | E6 recomendada a 0.8; E5 como alternativa; E7 como alternativa final |

Ajustes de inferencia declarados para la evaluacion: ComfyUI, sampler Euler a, 28 pasos, CFG 4.5, CLIP skip 2 y resolucion 832x1216, sin hires fix ni ADetailer.

## Requisitos de hardware

- VRAM: el LoRA en si ocupa unos 456 MB por fichero, pero se suma al checkpoint SDXL base; la inferencia completa de SDXL en bf16 requiere del orden de 10-12 GB de VRAM, y menos con cuantizacion del checkpoint base (dato no especificado en la informacion disponible).
- GPU recomendadas: el autor entreno en una NVIDIA DGX Spark; para inferencia son adecuadas GPUs consumer con 12 GB o mas, como RTX 3060 12 GB, RTX 4070 Ti o RTX 4090, asi como A100 o H100 en entornos de servidor.
- Cabe en GPU consumer: si, siempre que el checkpoint base SDXL quepa en VRAM; el adaptador anade una sobrecarga marginal.
- Despliegue: diffusers (libreria declarada), ComfyUI (usado en la evaluacion) y cualquier frontend que cargue LoRAs en safetensors para SDXL.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de otros LoRAs de personaje comparables en la informacion proporcionada. La comparacion se limita a las epocas del propio adaptador:

| Version | Fichero | Comportamiento observado | Recomendacion |
|---|---|---|---|
| E5 | `yotsugi_ononoki-000005.safetensors` | Coletas palidas y ojos verdes usables; el sombrero naranja aparece a menudo | Alternativa |
| E6 | `yotsugi_ononoki-000006.safetensors` | Retrato y cuerpo completo fieles: vestido naranja por capas, peto con estrella, calcetines rayados, botas amarillas y sombrero con ojos saltones | Predeterminada a 0.8 |
| E7 | `yotsugi_ononoki.safetensors` | Muy proxima a E6 | Alternativa final |

## Limitaciones y advertencias

- Es un derivado no oficial: los derechos del personaje pertenecen a sus titulares y el autor lo declara como fan-made.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibicion de usos daninos descritos en la licencia) y obliga a propagar las mismas restricciones en derivados.
- Dependencia estricta del checkpoint base waiIllustriousSDXL v17: usarlo sobre otro SDXL puede degradar la fidelidad del personaje.
- Dataset pequeno (53 pares, un solo conjunto de vestuario): la generalizacion a poses, angulos o atuendos no vistos puede ser limitada.
- Las captions omiten con frecuencia color de pelo y ojos, por lo que hay que anadirlos explicitamente en el prompt para evitar desviaciones.
- Riesgo de sobreajuste al estilo del dataset y de contaminacion de estilo al combinarlo con otros LoRAs.
- No hay datos publicados sobre sesgos demograficos ni sobre tasas de alucinacion visual (artefactos, anatomia incorrecta); la evaluacion es cualitativa y realizada por el propio autor.
- Sin descargas ni likes en el momento de la consulta: no existe validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abbuibuibui/YotsugiOnonoki-Lora
- Dataset en HuggingFace: https://huggingface.co/datasets/abbuibuibui/YotsugiOnonoki-Dataset
- Modelo en ModelScope: https://www.modelscope.cn/models/abbuibuibui/YotsugiOnonoki-Lora
- Dataset en ModelScope: https://www.modelscope.cn/datasets/abbuibuibui/YotsugiOnonoki-Dataset
- Notas de evaluacion (chino): `evaluation/横向测评记录.md` dentro del repositorio
- Checkpoint base: waiIllustriousSDXL v17 (no se proporciona URL en la informacion disponible)
