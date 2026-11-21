# prosenna/chatwith-gandhi

## Resumen

ChatWith — Gandhi es un paquete de modelo conversacional empaquetado para la aplicación Android ChatWith, distribuido por el usuario prosenna en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un ajuste fino mediante LoRA sobre Ministral 3 3B Instruct 2512, orientado a personificar a Mahatma Gandhi en conversaciones. El resultado se exporta a GGUF en cuantización Q4_K_M y se acompaña de un tokenizador GGUF propio y de una estructura de ficheros específica del formato 1 de ChatWith (manifiesto, lógica, cabecera y fichas indexadas).

El modelo base es un transformer de 3.429.006.336 parámetros (aproximadamente 3,4 mil millones), lo que lo sitúa en la gama de modelos pequeños aptos para ejecución en dispositivos móviles o hardware de consumo. El repositorio ocupa 4,3 GB e incluye tanto los pesos cuantizados como el tokenizador y los metadatos de la aplicación.

La relevancia de esta ficha es limitada desde el punto de vista de la investigación: se trata de una demo experimental de personaje, sin model card técnica convencional, sin licencia declarada y sin resultados de benchmarks. Resulta útil como ejemplo de empaquetado de modelos para aplicaciones móviles y de aplicación de LoRA sobre modelos pequeños, pero no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base: Ministral 3 3B Instruct 2512) |
| Parametros totales | 3.429.006.336 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp b12190); tokenizador GGUF `ministral3-3b-vocab.gguf` |

## Arquitectura y entrenamiento

El modelo subyacente es Ministral 3 3B Instruct 2512, un transformer de aproximadamente 3,4 mil millones de parámetros. Sobre él se aplicó un ajuste fino con LoRA para incorporar el personaje de Gandhi, según indica el autor en la model card. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO adicionales.

La exportación se realizó a GGUF con cuantización Q4_K_M mediante llama.cpp (build b12190). El paquete incluye un tokenizador GGUF específico (`ministral3-3b-vocab.gguf`) y una estructura de aplicación propietaria: `manifiesto.json`, `logica.js`, `cabecera.txt` y `fichas/indice.json`. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en formato multi-turno, orientada a la personificación de Gandhi.
- Ejecución local en Android a través de la aplicación ChatWith (versión 0.2.5, versionCode 7, o posterior).
- Inferencia mediante llama.cpp en formato GGUF Q4_K_M.
- Integración con el sistema de fichas y lógica de la app ChatWith (estructura de paquete de formato 1).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Conversación educativa sobre la figura histórica de Gandhi: la app puede presentar un interlocutor con el personaje para explorar su biografía y pensamiento, con la advertencia de que es una demo experimental y puede equivocarse.
- Prototipado de chatbots de personaje en Android: sirve como plantilla de empaquetado (manifiesto, lógica, fichas, tokenizador y pesos GGUF) para desarrolladores que quieran distribuir sus propios LoRA en la app ChatWith.
- Demostración de ajuste fino con LoRA sobre modelos de 3B: útil para evaluar el flujo completo de entrenamiento, cuantización a Q4_K_M y despliegue en dispositivo móvil.
- Pruebas de inferencia local en hardware de consumo: al ser un GGUF Q4_K_M de ~3,4B parámetros, permite experimentar con llama.cpp en equipos sin GPU dedicada.
- Evaluación de cuantización Q4_K_M en modelos pequeños: comparar la calidad del personaje frente al modelo base en distintas configuraciones de llama.cpp.
- Base para experimentos de alineación de personaje: permite estudiar cómo un LoRA modifica el estilo y el contenido de las respuestas de un modelo instruct pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF Q4_K_M de un modelo de ~3,4B parámetros ocupa del orden de 2 GB; el repositorio completo son 4,3 GB (incluye tokenizador y metadatos).
- GPU recomendadas: no disponible. Por tamaño, un modelo de 3,4B en Q4_K_M puede ejecutarse en GPU de consumo con 4-6 GB de VRAM, aunque el autor no lo especifica.
- Cabe en GPU de consumo: previsiblemente sí, en tarjetas con al menos 4-6 GB de VRAM, si bien no se confirma en la información disponible.
- Opciones de despliegue: llama.cpp (build b12190, indicado por el autor) y la aplicación Android ChatWith 0.2.5 o posterior. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ChatWith — Gandhi (este modelo) | 3,4B | no disponible | no disponible | GGUF Q4_K_M | LoRA de personaje sobre Ministral 3 3B Instruct 2512; paquete para app Android |
| Ministral 3 3B Instruct 2512 | ~3,4B | no disponible | no disponible | safetensors / GGUF | Modelo base instruct sin ajuste de personaje |
| Modelos de personaje GGUF de tamaño similar | no disponible | no disponible | no disponible | GGUF | No se dispone de datos concretos en la información proporcionada |

## Limitaciones y advertencias

- Demo experimental: el propio autor advierte que el modelo puede equivocarse y que no debe considerarse una fuente fiable.
- Riesgo de alucinación elevado en un modelo de personaje histórico: puede atribuir citas o hechos falsos a Gandhi.
- Sesgos conocidos: no documentados en la información disponible; al ser un personaje histórico, es previsible un sesgo en la representación de su figura.
- Licencia no declarada: no se especifican condiciones de uso comercial; debe tratarse como no apto para producción hasta aclararlo.
- Idiomas soportados no declarados: no se garantiza un rendimiento adecuado fuera del idioma en que se entrenó el LoRA.
- Longitud de contexto no disponible: no se puede planificar su uso en conversaciones largas.
- Dependencia de la app ChatWith: el paquete está atado al formato 1 y a la versión 0.2.5 (versionCode 7) o posterior; no es un modelo directamente consumible por otras herramientas sin extraer el GGUF.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria.
- Fecha de creación declarada en 2026-11-21: conviene verificar la coherencia temporal del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/prosenna/chatwith-gandhi
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
