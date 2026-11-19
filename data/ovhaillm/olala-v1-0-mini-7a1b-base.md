# OVHaiLLM/Olala-v1.0-mini-7A1B-base

## Resumen

Olala-v1.0-mini-7A1B-base es el modelo base preentrenado de la familia Olala-v1.0-mini, desarrollada por OVHai LLM (grupo OVHcloud) en Francia. Se trata de un modelo de generacion de texto construido sobre una arquitectura hibrida de Mamba-3 y mezcla de expertos (MoE) con atencion, con 6.773 millones de parametros totales y aproximadamente 1.000 millones de parametros activos por token, segun la nomenclatura "7A1B" del nombre. No esta ajustado por instrucciones ni alineado, por lo que se distribuye unicamente como punto de partida para investigacion y fine-tuning.

El modelo se entreno sobre 12,8 billones de tokens de datos publicos y sinteticos propios, con cobertura en ingles y otras 36 lenguas (38 durante la fase de annealing). Destaca especialmente en matematicas, con 72,2 en MATH en configuracion 4-shot, y el autor lo situa como el mejor de su clase entre modelos MoE de aproximadamente 1.000 millones de parametros activos, por delante de LFM2.5-8B-A1B y del modelo frances Luciole-23B.

Su relevancia actual radica en tres factores: la adopcion de una arquitectura hibrida Mamba-3/atencion con MoE, poco comun en modelos abiertos de este tamano; su licencia Apache 2.0, que permite uso comercial sin restricciones adicionales; y su origen europeo, con entrenamiento en los supercomputadores JUPITER (Alemania), Jean Zay (Francia) y MeluXina (Luxemburgo). Todo ello lo posiciona como una alternativa soberana a los modelos abiertos de origen estadounidense y chino en el segmento de modelos pequenos eficientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba-3 / atencion con mezcla de expertos (MoE) |
| Parametros totales | 6.773.124.144 (6,77 mil millones) |
| Parametros activos | Aproximadamente 1.000 millones (denominacion "7A1B") |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors, compatibles con cuantizacion estandar via transformers) |
| Idiomas soportados | Ingles, chino, frances, aleman, italiano, japones, ruso, espanol, polaco, portugues, neerlandes, griego, turco, checo, ucraniano, hungaro, rumano, coreano, arabe, finlandes, sueco, noruego, danes, bulgaro, eslovaco, croata, lituano, esloveno, bosnio, hebreo, estonio, catalan, leton, georgiano, serbio, albanes e islandes (37 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers, requiere custom_code) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida que combina capas Mamba-3 (modelo de espacio de estados) con capas de atencion, organizadas en un esquema de mezcla de expertos. Esta combinacion busca reducir el coste computacional de la atencion cuadratica en contextos largos manteniendo la capacidad de recuperacion precisa de informacion, mientras que el diseno MoE mantiene un numero reducido de parametros activos (aproximadamente 1.000 millones) por token procesado, lo que abarata la inferencia frente a un modelo denso del mismo tamano total.

El preentrenamiento consumio 12,8 billones de tokens en dos fases: una fase principal de 10,5 billones de tokens y una fase de annealing de 2,38 billones. Las fuentes de datos incluyen corpus web de alta calidad (Nemotron-CC-v2, FineWeb-2, FineWeb2-HQ, finepdfs), datos educativos y academicos (Fineweb-Edu-Chinese, cultura_ru_edu, olmo-mix-1124, stack-edu), codigo (Nemotron-Pretraining-Code-v2, Nemotron-CC-Code-v1, OpenCoder annealing corpus), matematicas (MegaMath, finemath, Nemotron-CC-Math-v1, Nemotron-Math-v2, OpenMathInstruct-1, NuminaMath-1.5), Wikipedia y tres conjuntos sinteticos propios de OVHai LLM (Math-Enrich-Multilingual, Wikipedia-ActiveReading y ProofWiki-ActiveReading). El entrenamiento se ejecuto en 1.024 GPU NVIDIA GH200 en JUPITER y en GPU NVIDIA H100 en Jean Zay, con un consumo energetico estimado de 1,16 GWh y unas emisiones de 30-50 toneladas de CO2 equivalente. La model card no detalla si se aplicaron tecnicas de RLHF o DPO en esta variante base, aunque el autor menciona SFT y RL en el computo global de emisiones de la familia.

## Capacidades

- Generacion de texto autoregresiva sin ajuste por instrucciones: el modelo continua texto, no mantiene formato conversacional ni responde a instrucciones de sistema.
- Razonamiento matematico: 72,2 en MATH (4-shot), el segundo mejor resultado entre los 12 modelos base comparados por el autor.
- Generacion de codigo: entrenado con corpus especificos de codigo (Nemotron-Pretraining-Code-v1 y v2, OpenCoder), aunque sin datos publicos de benchmarks de codigo en la informacion disponible.
- Capacidades multilingues en 37 idiomas, incluyendo espanol, catalan, portugues, frances, aleman, arabe, chino y japones.
- Base para fine-tuning: pensado como punto de partida para SFT, RLHF/DPO y entrenamiento de tareas especificas.
- Soporte de tool calling / function calling: no disponible en la variante base (requiere ajuste posterior).
- Soporte de agentes y razonamiento multi-paso: no disponible sin ajuste por instrucciones.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Investigacion en arquitecturas hibridas: el modelo permite estudiar el comportamiento de capas Mamba-3 combinadas con atencion y MoE en un modelo abierto de 6,77 mil millones de parametros, comparando su eficiencia frente a transformers densos equivalentes.
- Fine-tuning para dominios especializados: al ser un modelo base con licencia Apache 2.0, se puede ajustar con SFT sobre datos propios de un sector (legal, sanitario, financiero) sin restricciones de uso comercial y con un coste de inferencia contenido gracias a sus aproximadamente 1.000 millones de parametros activos.
- Generacion de texto en produccion tras ajuste: una vez alineado, puede desplegarse para tareas de redaccion, resumen o continuacion de texto en entornos con presupuesto de GPU limitado, ya que el esquema MoE reduce el coste por token frente a un modelo denso de 7B.
- Entrenamiento de modelos de razonamiento matematico: su rendimiento en MATH (72,2 en 4-shot) lo hace adecuado como base para destilacion o ajuste con datos de cadenas de razonamiento matematico en multiples idiomas.
- Desarrollo de asistentes multilingues europeos: la cobertura de 37 idiomas, con especial atencion a lenguas europeas de menor recursos (catalan, estonio, lituano, esloveno, islandes, georgiano), permite construir asistentes para mercados regionales con un unico modelo base.
- Evaluacion comparativa de recetas de datos: la model card detalla por fuente el mix de preentrenamiento, lo que permite reproducir o ablar estudios sobre el impacto de cada corpus en tareas especificas.
- Base para modelos de codigo: tras ajuste con datos de instrucciones de programacion, puede emplearse en autocompletado o generacion de codigo en entornos con recursos de GPU moderados.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| MATH (4-shot) | 72,2 | Segundo mejor de 12 modelos base comparados; por delante de todos los Qwen3.5, incluido Qwen3.5-35B-A3B |
| Media de benchmarks | No disponible numericamente | El autor afirma que es el mejor de su clase entre MoE de aproximadamente 1B activos, por delante de LFM2.5-8B-A1B y Luciole-23B |

No se han publicado en la informacion disponible resultados numericos de MMLU, HumanEval, GSM8K ni otros benchmarks adicionales, ni tablas comparativas detalladas. El informe tecnico enlazado en la model card es la fuente indicada para consultar el detalle completo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 13,5 GB solo para pesos (6,77 mil millones de parametros x 2 bytes), mas overhead de activaciones y cache, lo que situa el requisito practico en torno a 16-20 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 7 GB para pesos, con un requisito practico de 10-12 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 3,5-4 GB para pesos, con un requisito practico de 6-8 GB, lo que permite ejecucion en GPU de consumo.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 y en GPU de 8-12 GB con cuantizacion de 4 u 8 bits, siempre que el runtime soporte la arquitectura hibrida Mamba-3/MoE.
- GPU de datacenter: A100 (40/80 GB), H100 (80 GB) y GH200 para despliegues de mayor throughput o contexto largo.
- Opciones de despliegue: transformers con `trust_remote_code=True` (la model card indica `custom_code`); la compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta confirmada en la informacion disponible y depende de que dichos runtimes implementen la arquitectura Mamba-3 hibrida.
- Latencia y throughput: no disponibles. La reduccion de parametros activos a aproximadamente 1.000 millones sugiere un coste por token inferior al de un modelo denso de 7B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Olala-v1.0-mini-7A1B-base | 6,77B / ~1B | No disponible | MATH 4-shot: 72,2 | Apache 2.0 | Pesos abiertos en Hugging Face |
| LFM2.5-8B-A1B | 8B / ~1B | No disponible | Inferior en media segun el autor, pese a entrenarse con el triple de tokens | No disponible en la informacion | Pesos abiertos |
| Luciole-23B | 23B | No disponible | Inferior segun el autor pese a triplicar parametros | No disponible en la informacion | Pesos abiertos |
| Qwen3.5-35B-A3B | 35B / 3B | No disponible | Inferior en MATH 4-shot segun el autor | No disponible en la informacion | Pesos abiertos |

La comparativa se basa exclusivamente en las afirmaciones de la model card; no se dispone de tablas numericas independientes para verificar cada resultado.

## Limitaciones y advertencias

- Modelo base sin alineacion: no ha recibido ajuste por instrucciones ni entrenamiento de seguridad, por lo que puede generar contenido toxico, odioso, sesgado o falso. El autor advierte explicitamente de que no debe exponerse a usuarios finales ni usarse como asistente.
- Riesgo de alucinacion: al ser un modelo de continuacion de texto sin ajuste, no distingue entre hechos verificados e inventados; cualquier uso en produccion requiere capas de verificacion y filtrado.
- Sesgos de datos: el corpus de preentrenamiento procede mayoritariamente de web, codigo y fuentes academicas en ingles y otras lenguas, con los sesgos inherentes a esas fuentes; no se documentan evaluaciones de sesgo en la informacion disponible.
- Cobertura idiomatica desigual: aunque declara 37 idiomas, el volumen de datos por lengua no es homogeneo; las lenguas con menos recursos (islandes, georgiano, albanes, bosnio) probablemente rindan peor que ingles, chino o frances.
- Longitud de contexto no documentada: no se especifica la ventana maxima, lo que impide planificar casos de uso con documentos largos sin verificacion empirica.
- Compatibilidad de despliegue limitada: al requerir `custom_code` y una arquitectura hibrida Mamba-3/MoE, puede no funcionar en runtimes de inferencia estandar (vLLM, llama.cpp, Ollama) sin soporte especifico; conviene validar el stack antes de comprometerse en produccion.
- Licencia Apache 2.0: permite uso comercial y modificacion sin restricciones adicionales, pero no exime de cumplir la normativa aplicable (por ejemplo, obligaciones de transparencia del Reglamento europeo de IA para sistemas de proposito general).
- Emisiones declaradas: 30-50 toneladas de CO2 equivalente y 1,16 GWh para el entrenamiento completo de la familia, dato relevante para informes de sostenibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B-base
- Variante ajustada por instrucciones: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B
- Informe tecnico (PDF): https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B/blob/main/Olala-v1.0-mini.pdf
- Catalogo de AI Endpoints de OVHcloud: https://www.ovhcloud.com/en/public-cloud/ai-endpoints/catalog/olala-1.0-mini/
- Playground: https://olala.ovh.com
