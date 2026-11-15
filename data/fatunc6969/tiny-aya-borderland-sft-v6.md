# FatUnc6969/tiny-aya-borderland-sft-v6

## Resumen

Tiny Aya Borderland SFT v6 es un adaptador LoRA (PEFT) publicado por el usuario FatUnc6969 sobre el modelo base CohereLabs/tiny-aya-global. Se trata de un ajuste fino supervisado (SFT) continuado a partir de la version v5 del mismo autor (FatUnc6969/tiny-aya-borderland-sft-v5), entrenado sobre el fichero sft-v6.jsonl en el contexto del proyecto Borderland y de una destilacion denominada AgentTune, dentro del marco de un hackathon identificado como lexsi-hackathon.

El modelo no es un modelo completo, sino un conjunto de pesos de adaptador que requieren cargar el modelo base CohereLabs/tiny-aya-global para funcionar. El repositorio ocupa 0,3 GB y contiene pesos en formato safetensors gestionados mediante la libreria PEFT. La model card es minima y remite a un repositorio de GitHub (VasuBansal7576/lexi-borderland) para obtener mas contexto sobre el entrenamiento.

La relevancia de esta ficha es limitada: se trata de un experimento de hackathon con cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados y sin benchmarks publicados. Resulta util unicamente como referencia de adaptadores LoRA de bajo coste sobre modelos compactos multilingues de la familia Aya, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer CohereLabs/tiny-aya-global |
| Parametros totales | no disponible (el adaptador LoRA ocupa 0,3 GB en el repo; los parametros del modelo base no se detallan en la informacion proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con la libreria PEFT sobre el modelo base CohereLabs/tiny-aya-global. No se especifican en la informacion disponible el rango del adaptador, las capas objetivo, el learning rate ni el numero de pasos. El entrenamiento es un SFT continuado desde el checkpoint FatUnc6969/tiny-aya-borderland-sft-v5, utilizando el dataset sft-v6.jsonl, que segun la model card corresponde a una destilacion de tipo AgentTune en el contexto del proyecto Borderland.

No se detalla la composicion del dataset, el numero de tokens de entrenamiento, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, attention lineal, mezcla de expertos) mas alla de la propia naturaleza de adaptador LoRA sobre el modelo base. El modelo base tiny-aya-global pertenece a la familia Aya de Cohere Labs, orientada a cobertura multilingue, pero las capacidades efectivas tras el ajuste no estan documentadas en la informacion proporcionada.

## Capacidades

- Ajuste fino supervisado orientado, segun las etiquetas del repositorio, a tareas de tipo agente (agenttune) y al contexto del proyecto Borderland.
- Al estar construido sobre tiny-aya-global, hereda potencialmente las capacidades multilingues del modelo base, aunque no se documenta que idiomas conserva ni en que grado tras el SFT.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: la etiqueta agenttune sugiere entrenamiento orientado a comportamiento agentico, pero no se detallan capacidades verificables.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Generacion de codigo, matematicas o razonamiento: no documentado para este adaptador.

## Casos de uso

- Experimentacion academica con LoRA: el adaptador sirve para reproducir y comparar el efecto de un SFT continuado sobre tiny-aya-global en un entorno controlado, cargando el adaptador con PEFT sobre el modelo base.
- Investigacion en destilacion de comportamiento agentico: el dataset AgentTune y el proyecto Borderland pueden estudiarse como ejemplo de pipeline de destilacion aplicado a un modelo compacto.
- Prototipado rapido en hackathons: al ocupar solo 0,3 GB, el adaptador es facil de distribuir y cargar en entornos con recursos limitados para pruebas de concepto.
- Base para iteraciones posteriores: al existir una cadena v5 a v6, sirve como punto de partida documentado para futuros ajustes del mismo autor o de la comunidad.
- Evaluacion de adaptadores de bajo rango sobre modelos multilingues: util para medir cuanto se degrada o se preserva la cobertura linguistica del modelo base tras un SFT especifico.
- Docencia y formacion: ejemplo practico de publicacion de un adaptador PEFT en Hugging Face con model card minima y trazabilidad a un repositorio de GitHub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; depende del modelo base tiny-aya-global y de la cuantizacion elegida, no del adaptador (0,3 GB adicionales en precision original).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Encaje en GPU de consumo: no confirmado; el adaptador es ligero, pero el requisito real lo marca el modelo base, cuyo tamano no se detalla en la informacion disponible.
- Opciones de despliegue: carga mediante la libreria PEFT sobre el modelo base; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FatUnc6969/tiny-aya-borderland-sft-v6 | Adaptador LoRA sobre tiny-aya-global | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| FatUnc6969/tiny-aya-borderland-sft-v5 | Adaptador LoRA sobre tiny-aya-global (predecesor) | no disponible | no disponible | no disponible | Hugging Face |
| CohereLabs/tiny-aya-global | Modelo base completo | no disponible en la informacion proporcionada | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La model card es minima: no declara licencia, idiomas, contexto ni datos de entrenamiento, lo que impide evaluar su idoneidad para uso comercial o produccion.
- Al ser un adaptador LoRA, no funciona de forma autonoma: requiere descargar y cargar CohereLabs/tiny-aya-global, cuyas condiciones de licencia deben respetarse por separado.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado; al derivar de un SFT sobre un dataset de hackathon, no hay garantias de calidad ni de alineacion.
- El entrenamiento continuado desde v5 sobre un dataset especifico (sft-v6.jsonl) puede provocar olvido catastrofico de capacidades del modelo base, especialmente en cobertura multilingue.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad, sin issues ni discusiones que permitan contrastar su comportamiento.
- Ausencia de benchmarks: no hay evidencia cuantitativa de mejora frente al modelo base ni frente a v5.
- No apto para produccion sin una evaluacion propia exhaustiva de calidad, sesgos, seguridad y licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FatUnc6969/tiny-aya-borderland-sft-v6
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Predecesor: https://huggingface.co/FatUnc6969/tiny-aya-borderland-sft-v5
- Repositorio del proyecto: https://github.com/VasuBansal7576/lexi-borderland
