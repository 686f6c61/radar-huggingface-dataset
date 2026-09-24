# OS-Software/CyberStag-Security-26B-A4B-V1-Uncensored-Heretic-GGUF

## Resumen

CyberStag-Security-26B-A4B-V1-Uncensored-Heretic-GGUF es una version "decensored" (abliterated) del modelo deer-sec/CyberStag-Security-26B-A4B-V1-BF16-MLX, que a su vez deriva del modelo base google/gemma-4-26b-a4b. Lo publica el usuario OS-Software y el proceso de ablacion se ha realizado con la herramienta Heretic v2.0.0.dev0+custom, una utilidad especifica para eliminar direcciones de rechazo en el espacio de activaciones sin reentrenar el modelo completo.

El objetivo declarado es obtener un modelo orientado a ciberseguridad y tareas de seguridad que no aplique rechazos ante peticiones que el modelo original bloquearia. Segun la model card, el modelo original rechazaba 98 de cada 100 peticiones de prueba, mientras que esta variante rechaza 0 de 100, con una divergencia KL de 0.0135 respecto al original, lo que indica que la modificacion es relativamente contenida en terminos de distribucion de salidas.

La relevancia de esta ficha es fundamentalmente metodologica y de evaluacion de riesgos: es un ejemplo de ablacion selectiva sobre un modelo de gran tamano con pesos publicados en formato GGUF (147,4 GB en el repositorio) y licencia Apache 2.0. El autor restringe explicitamente su uso a investigacion, estudios de alineacion y red-teaming, y desaconseja su despliegue en servicios publicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explicita en la model card. El nombre del modelo base (gemma-4-26b-a4b) y los tags sugieren un transformer con mezcla de expertos (MoE) y aproximadamente 4B de parametros activos, pero no se confirma |
| Parametros totales | 25.233.142.046 (~25,2B), segun los pesos safetensors del repositorio |
| Parametros activos | No disponible de forma explicita. La nomenclatura "A4B" del modelo base apunta a unos 4B activos por token |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (el repositorio esta etiquetado con "imatrix"); el listado concreto de niveles de cuantizacion (Q4_K_M, Q5_K_M, Q8_0, etc.) no se detalla en la informacion proporcionada |
| Idiomas soportados | Multilingue, con enfasis declarado en ingles (en) y japones (ja) |
| Licencia | apache-2.0 (obra derivada sujeta a la licencia aplicable del modelo base) |
| Formato de pesos | GGUF para el repositorio publicado; el modelo de origen del que deriva estaba en BF16-MLX |
| Modelo base | google/gemma-4-26b-a4b |
| Modelo del que deriva directamente | deer-sec/CyberStag-Security-26B-A4B-V1-BF16-MLX |
| Tamano del repositorio | 147,4 GB |
| Herramienta de ablacion | Heretic v2.0.0.dev0+custom |
| Pipeline | text-generation |
| Libreria declarada | transformers |

## Arquitectura y entrenamiento

Esta ficha no describe un entrenamiento desde cero, sino una intervencion post-entrenamiento sobre pesos ya existentes. La modificacion se ha aplicado con Heretic, un metodo de ablacion que localiza direcciones de comportamiento en el espacio de activaciones y las proyecta fuera, en lugar de reajustar los pesos con fine-tuning supervisado o RLHF/DPO. Los parametros concretos publicados son: capas objetivo entre los indices 12 y 20 (de un total no especificado), `preserve_good_behavior_weight` de 1.0 y `steer_bad_behavior_weight` de 0.0001, `overcorrect_relative_weight` de 1.0, `neighbor_count` de 1, `ridge_regularization` de 7e-07, `transport_rank` de 4, `entropy_regularization` de 0.1, transporte gaussiano, `lora_rank` de 128, `row_normalization` desactivada, componentes objetivo `attn.o_proj` y `mlp.down_proj`, `covariance_regularization` de 0.01 y `max_weight_change` de 1.0.

No se especifican en la informacion disponible el numero de tokens de entrenamiento original, la composicion del dataset, ni si el modelo base paso por RLHF o DPO. Tampoco se detalla la arquitectura interna mas alla de lo que sugiere la nomenclatura del modelo base (posible MoE) ni si incorpora innovaciones como atencion lineal, decodificacion especulativa o modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional multilingue, con soporte declarado de ingles y japones y cobertura multilingue generica.
- Razonamiento y tareas de seguridad/ciberseguridad, que es el dominio para el que se ha construido la variante CyberStag-Security.
- Reduccion deliberada de rechazos: la model card reporta 0/100 rechazos frente a 98/100 del modelo original en su conjunto de prueba.
- Uso como modelo de investigacion en alineacion: permite comparar el comportamiento del modelo abliterado contra el original manteniendo una divergencia KL de 0.0135.
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`) y con el ecosistema llama.cpp/GGUF mediante el formato de pesos publicado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada, aunque el tag `reasoning` aparece en los metadatos.
- Capacidades especiales (modo thinking explicito, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Red-teaming interno de productos de IA: el modelo sirve como generador adversario controlado para producir prompts y respuestas que un modelo alineado rechazaria, permitiendo al equipo de seguridad medir la robustez de sus propios filtros.
- Investigacion en alineacion y ablation: comparar sistematicamente las salidas de esta variante con las del modelo original (KL 0.0135) para estudiar que comportamientos se ven afectados por la ablacion de las capas 12 a 20.
- Evaluacion de clasificadores de contenido danino: usar el modelo como fuente de ejemplos positivos en un pipeline de etiquetado, siempre que los datos se mantengan en un entorno aislado y con supervision humana.
- Analisis de ciberseguridad sobre texto tecnico: dado el enfoque declarado del modelo base, puede emplearse para resumir y estructurar documentacion de vulnerabilidades o informes tecnicos en un entorno de laboratorio.
- Pruebas de conformidad de guardrails: integrarlo en un banco de pruebas interno para verificar que las capas de moderacion de una aplicacion bloquean contenido que este modelo si generaria.
- Estudio de la degradacion de utilidad tras ablacion: medir en tareas neutras (resumen, traduccion en/ja, generacion de texto general) cuanto se pierde respecto al modelo original, para caracterizar el coste real de la ablacion.
- Docencia en seguridad de IA: demostraciones controladas sobre como la eliminacion de direcciones de rechazo afecta al comportamiento de un modelo de 25B, con el modelo aislado de cualquier usuario final.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni cualquier servicio expuesto a usuarios finales, tal y como advierte el propio autor.

## Benchmarks y rendimiento

Los unicos datos cuantitativos publicados en la model card son los relativos al proceso de ablacion, no a benchmarks estandar de capacidades (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos | 0/100 | 98/100 |
| Divergencia KL | 0.0135 | 0 (por definicion) |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 25,2B parametros totales, los pesos en FP16 ocupan en torno a 50 GB; en Q8_0 unos 27 GB; en Q6_K unos 21 GB; en Q5_K_M unos 18 GB; en Q4_K_M unos 15-16 GB; en Q3_K_M unos 12 GB y en Q2_K unos 9-10 GB. Son estimaciones aritmeticas a partir del numero de parametros, no medidas publicadas por el autor.
- Al ser un modelo con posible arquitectura MoE, la VRAM necesaria viene determinada por los parametros totales (hay que cargar todos los expertos), no por los activos.
- GPU recomendadas: H100 80 GB o A100 80 GB para FP16/BF16; A100 40 GB, L40S 48 GB o RTX A6000 48 GB para cuantizaciones de 8 bits; RTX 4090 24 GB o RTX 3090 24 GB para cuantizaciones de 4-5 bits.
- Cabe en GPU de consumo: si, en tarjetas con 16-24 GB de VRAM usando cuantizaciones Q4/Q5, y en configuraciones de 8-12 GB con cuantizaciones mas agresivas a costa de perdida de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y servidores compatibles con GGUF. vLLM y TGI tienen soporte parcial o experimental de GGUF; conviene verificar la compatibilidad concreta antes de desplegar.
- Latencia y throughput: no disponibles. Al tratarse presumiblemente de un MoE con unos 4B parametros activos, la velocidad de decodificacion por token deberia ser mas cercana a la de un modelo denso de 4B que a la de uno de 25B, siempre que la VRAM sea suficiente para mantener todos los expertos en memoria.

## Comparativa con modelos similares

No hay datos de benchmarks de este modelo que permitan una comparacion de rendimiento fiable. La tabla siguiente compara caracteristicas estructurales con alternativas de tamano parecido; los datos de los modelos alternativos proceden de sus model cards publicas y deben verificarse antes de tomar decisiones.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Estado de alineacion |
|---|---|---|---|---|---|
| CyberStag-Security-26B-A4B-V1-Uncensored-Heretic (este modelo) | ~25,2B | ~4B (segun nomenclatura, no confirmado) | No disponible | apache-2.0 | Abliterado, sin rechazos reportados |
| Qwen3-30B-A3B | ~30,5B | ~3,3B | 32K nativo, ampliable a 128K | Apache 2.0 | Alineado |
| Gemma 3 27B (denso) | 27B | 27B | 128K | Licencia Gemma | Alineado |

La diferencia clave de esta variante no es de capacidad bruta, sino de comportamiento: es un modelo desalineado deliberadamente, con un proposito de investigacion en seguridad, y por tanto no es intercambiable con los modelos anteriores en entornos de produccion.

## Limitaciones y advertencias

- Reduccion sustancial del alineamiento de seguridad: el propio autor advierte que es mas probable que genere contenido danino, inexacto, sesgado u ofensivo que un modelo estandar.
- Riesgo elevado de alucinacion y de afirmaciones no verificadas: todas las salidas deben tratarse como no confiables y verificarse de forma independiente.
- Sesgos: no se documenta ninguna evaluacion de sesgos para esta variante; la ablacion puede alterar de forma asimetrica el comportamiento en distintos colectivos.
- Uso previsto restringido: investigacion, estudios de alineacion y red-teaming. El autor pide evitar su despliegue en servicios publicos o de cara a usuarios finales.
- Responsabilidad del usuario: evaluar la idoneidad del contenido, implementar salvaguardas y supervision humana, y cumplir la legislacion aplicable. El uso es enteramente bajo riesgo del usuario.
- Restricciones de licencia: los metadatos indican apache-2.0, pero al ser una obra derivada queda sujeta a la licencia aplicable del modelo base (google/gemma-4-26b-a4b). Hay que verificar los terminos de esa licencia antes de cualquier uso comercial.
- Idioma: solo se declaran ingles y japones de forma explicita dentro del soporte multilingue; no hay garantias de calidad en castellano.
- Sin datos de contexto, cuantizaciones disponibles ni benchmarks de capacidades publicados, lo que dificulta planificar un despliegue en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- Exencion de garantias: OS-Software no asume responsabilidad por danos directos o indirectos, perdidas, mal uso o consecuencias legales derivadas del uso del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OS-Software/CyberStag-Security-26B-A4B-V1-Uncensored-Heretic-GGUF
- Modelo del que deriva: https://huggingface.co/deer-sec/CyberStag-Security-26B-A4B-V1-BF16-MLX
- Modelo base: google/gemma-4-26b-a4b (referenciado en los metadatos; no se proporciona URL directa en la informacion disponible)
- Heretic (herramienta de ablacion): https://heretic-project.org
- Repositorio de Heretic en GitHub: https://github.com/p-e-w/Heretic
