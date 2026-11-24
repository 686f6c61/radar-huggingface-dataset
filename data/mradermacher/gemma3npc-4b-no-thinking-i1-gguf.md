# mradermacher/Gemma3NPC-4B-no-thinking-i1-GGUF

## Resumen

Gemma3NPC-4B-no-thinking-i1-GGUF es una cuantizacion GGUF del modelo chimbiwide/Gemma3NPC-4B-no-thinking, un ajuste fino de Gemma 3 de 4B orientado a la interpretacion de personajes no jugadores (NPC) en juegos de rol. El trabajo de cuantizacion lo firma mradermacher, autor habitual de versiones GGUF de modelos abiertos, y emplea el metodo i1 (imatrix) para generar un abanico amplio de niveles de compresion. El modelo base parte de la familia Gemma 3 de Google DeepMind, con aproximadamente 3.880 millones de parametros, y se ha especializado mediante el dataset chimbiwide/NPC-RP-No-Thinking, centrado en conversaciones de rol sin modo de razonamiento explicito.

La relevancia de esta ficha esta en que permite ejecutar un modelo conversacional especializado en personajes de rol en hardware de consumo, gracias a las cuantizaciones que van desde 1,2 GB (IQ1_S) hasta 3,3 GB (Q6_K). La distribucion i1 de mradermacher prioriza la calidad por tamano, de modo que las variantes IQ suelen superar a las Q de tamano equivalente. El modelo esta pensado para ingles y para dialogos de personaje, no para tareas generales de razonamiento o codigo.

Al tratarse de un derivado de Gemma, hereda la licencia Gemma de Google, que impone condiciones de uso y requiere aceptacion explicita en Hugging Face. Esto condiciona su uso comercial y su redistribucion, un punto que cualquier equipo de produccion debe revisar antes de integrarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 3), ajuste fino para rol/NPC |
| Parametros totales | 3.880.263.168 (3,88B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K; tambien disponibles cuantizaciones estaticas en el repo hermano |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (Google Gemma Terms of Use) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base chimbiwide/Gemma3NPC-4B-no-thinking es un ajuste fino de Gemma 3 de 4B, una arquitectura transformer decoder-only. El sufijo "no-thinking" indica que se ha entrenado sin modo de razonamiento explicito, es decir, sin cadenas de pensamiento visibles, lo que produce respuestas directas y mas adecuadas para dialogo de personaje. El dataset de ajuste es chimbiwide/NPC-RP-No-Thinking, orientado a conversaciones de rol con NPC. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La cuantizacion la realiza mradermacher con el metodo i1, que emplea un fichero imatrix (incluido en el repo, 0,1 GB) para ponderar la importancia de los tensores durante la cuantizacion. Esto mejora la calidad respecto a cuantizaciones estaticas del mismo tamano. El repo incluye ademas un flag de modelo de vision, y las mmproj (si existen) se alojan en el repositorio estatico hermano, no en este. No se detalla ninguna innovacion adicional como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, optimizada para dialogo de personaje (NPC) en juegos de rol.
- Respuestas directas sin modo de razonamiento explicito ("no-thinking"), adecuadas para interacciones en tiempo real.
- Coherencia de personaje y mantenimiento de rol a lo largo de turnos de conversacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo esta orientado a dialogo, no a tareas agenciales.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Capacidades especiales (vision, audio, thinking mode): el repo menciona que es un modelo de vision y que las mmproj estarian en el repo estatico, pero no se confirma su disponibilidad en esta distribucion.

## Casos de uso

- Dialogo de NPC en videojuegos: el modelo puede generar respuestas de personaje coherentes en ingles para NPC de rol, con cuantizaciones de 2,5-3 GB que caben en GPU de consumo y permiten inferencia local de baja latencia.
- Prototipado de experiencias de rol conversacional: util para validar guiones y personalidades de personaje antes de invertir en modelos mayores, gracias a su tamano reducido y a la variedad de cuantizaciones.
- Mods y servidores de rol (RPG de mesa online): integrable en herramientas de chat o en motores de juego que acepten GGUF via llama.cpp, para dotar de voz a personajes secundarios.
- Generacion de dialogos de relleno para mundos abiertos: el modelo produce lineas de personaje rapidas y baratas en hardware modesto, adecuadas para contenido no critico.
- Asistentes de rol para escritores: ayuda a explorar voces de personaje y variaciones de dialogo en ingles durante la escritura creativa.
- Despliegue en edge o en equipos sin GPU dedicada: las variantes IQ2/IQ3 (1,4-2,1 GB) permiten ejecucion en CPU o en GPU integradas, utiles para demos y entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,7 GB para IQ1/IQ2, 2,0-2,6 GB para IQ3/Q4, y 2,9-3,3 GB para Q5/Q6, mas el overhead de contexto y del runtime.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para las cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput y contextos largos.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 4-8 GB de VRAM usando Q4_K_M o IQ4_XS; las variantes IQ2/IQ3 pueden ejecutarse incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers, pero esta distribucion es GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma3NPC-4B-no-thinking-i1-GGUF (este) | 3,88B | no disponible | gemma | GGUF (i1) | Ajuste fino para NPC/rol, solo ingles |
| Gemma3NPC-4B-no-thinking-GGUF (estatico) | 3,88B | no disponible | gemma | GGUF (estatico) | Misma base, cuantizaciones estaticas y mmproj |
| Gemma 3 4B (base) | ~4B | no disponible | gemma | safetensors, GGUF | Modelo generalista de Google, sin especializacion en rol |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Gemma 3, puede heredar sesgos del modelo base; no se documentan evaluaciones de sesgo especificas para este ajuste.
- Riesgo de alucinacion: presente como en cualquier modelo generativo; en rol puede inventar detalles de personaje o de mundo si el contexto no los fija.
- Limitaciones de contexto o idioma: solo ingles segun los metadatos; la longitud de contexto no se especifica en esta distribucion.
- Restricciones de licencia: la licencia Gemma de Google impone condiciones de uso, requiere aceptacion explicita en Hugging Face y limita la redistribucion y el uso comercial; revisar los terminos antes de produccion.
- Caveat de produccion: es un ajuste fino especializado en dialogo de personaje, no un modelo generalista; no debe usarse para tareas de razonamiento, codigo o matematicas sin validacion.
- Las cuantizaciones IQ1/IQ2 degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Gemma3NPC-4B-no-thinking-i1-GGUF
- Modelo base: https://huggingface.co/chimbiwide/Gemma3NPC-4B-no-thinking
- Dataset de ajuste: https://huggingface.co/datasets/chimbiwide/NPC-RP-No-Thinking
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Gemma3NPC-4B-no-thinking-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Gemma3NPC-4B-no-thinking-i1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
