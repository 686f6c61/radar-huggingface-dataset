# isilicon/mango-dflash2

## Resumen

Mango DFlash2 es un componente auxiliar de decodificación especulativa (draft model) publicado por isilicon bajo el paraguas del proyecto Mango. No se trata de un modelo de lenguaje autónomo, sino de un borrador de tokens por difusión de bloques que un modelo objetivo (target) verifica durante la inferencia. Su función es acelerar la generación del modelo Qwen3.8 27B mediante decodificación especulativa, reduciendo el número de pasos necesarios para producir secuencias completas.

El artefacto es un espejo de preservación del modelo original de z-lab, `z-lab/Qwen3.8-27B-DFlash2`, con revisión fijada y bytes de origen sin modificar. Incluye únicamente `config.json` y `model.safetensors` (3,85 GB decimales / 3,58 GiB), con un total de 1.924.404.480 parámetros según los safetensors. La licencia declarada es Apache 2.0 y la arquitectura se etiqueta como qwen3, con la innovación DFlash2 de difusión por bloques.

Su relevancia es operativa: en pipelines de inferencia de alto rendimiento, un draft model bien calibrado puede multiplicar el throughput del modelo objetivo sin degradar la calidad de salida, siempre que el runtime soporte el esquema DFlash2. Este repositorio no publica una puntuación de calidad independiente porque el resultado pertenece a la configuración completa target + draft + motor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con difusión por bloques (DFlash2), derivada de Qwen3 |
| Parametros totales | 1.924.404.480 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo objetivo y del runtime) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (config.json + model.safetensors) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de difusión por bloques (block-diffusion) orientada a la generación de borradores de tokens. En lugar de predecir token a token de forma autorregresiva, DFlash2 propone bloques de tokens candidatos que el modelo objetivo verifica en paralelo, técnica conocida como decodificación especulativa. La arquitectura base se etiqueta como qwen3, lo que sugiere una adaptación del transformer de Qwen3 al paradigma de borrador.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que el trabajo original corresponde a z-lab y apunta a la release de incoai, pero no detalla el proceso de entrenamiento. La innovación técnica destacable es precisamente el esquema DFlash2 de difusión por bloques, cuya eficacia se mide en longitud de aceptación (acceptance length) y throughput en SGLang/vLLM según las tablas del publicador.

## Capacidades

- Generación de borradores de tokens para decodificación especulativa: propone candidatos que el modelo objetivo verifica.
- Aceleración de inferencia: reduce el número de pasos autorregresivos del modelo target cuando el runtime soporta DFlash2.
- Integración con motores de inferencia de alto rendimiento: la model card menciona SGLang y vLLM en las tablas del publicador.
- No es un modelo de chat autónomo: carece de comando de lanzamiento independiente y debe instalarse a través del runtime del modelo consumidor.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo propias; estas pertenecen al modelo objetivo.
- No se documenta un modo de razonamiento (thinking) propio.

## Casos de uso

- Aceleración de inferencia en producción con Qwen3.8 27B: desplegar el draft junto al target en vLLM o SGLang para reducir la latencia por token en cargas de generación larga, siempre que el motor soporte DFlash2.
- Servicio de chat de alto throughput: combinar el draft con el target para aumentar las peticiones por segundo en un endpoint de conversación multi-turno, donde la verificación por bloques amortiza el coste del borrador.
- Generación de código en pipelines de CI/CD: usar la decodificación especulativa para acelerar la síntesis de parches y sugerencias en herramientas internas que ya sirven Qwen3.8 27B.
- Evaluación comparativa de motores: medir acceptance length y throughput de DFlash2 frente a otros esquemas de borrador (EAGLE, MTP) en el mismo target para elegir la configuración óptima.
- Investigación sobre decodificación especulativa: estudiar el comportamiento de la difusión por bloques como draft en condiciones controladas, con revisión fijada y bytes verificados.
- Réplica de entornos de evaluación: al ser un espejo con revisión fijada y manifiesto SHA-256, permite reproducir exactamente una configuración de inferencia en auditorías o experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad independientes para estos archivos exactos en la información disponible. La model card indica explícitamente que no existe una puntuación Mango de calidad para este artefacto, ya que es un componente auxiliar y el resultado pertenece a la configuración target + draft + motor.

Resultados de configuraciones relacionadas medidas por separado (no describen este artefacto):

| Configuracion distinta | Puntuacion ponderada | Minimo de carga |
|---|---|---|
| Qwen3.8 27B Cyber · IQ4_XS imatrix · MTP embebido | 70,27 | 29,74 |
| Qwen3.8 27B Cyber · Q6_K · Q8 MTP + proyector | 66,98 | 45,60 |
| Qwen3.8 27B · MLX affine 4-bit · OrcaRouter | 80,64 | 23,98 |

Estudio de esfuerzo Qwen (cohorte separada de 404 preguntas): medium 82,87/100 frente a xhigh 84,41/100, con diferencia pareada de +1,54 puntos (intervalo del 95 % [-1,71, +4,82]).

## Requisitos de hardware

- Peso en disco del artefacto: 3,85 GB decimales (3,58 GiB); el tamaño del repo es de 3,8 GB.
- VRAM estimada para el draft: no disponible de forma oficial; la model card advierte que el tamaño en disco no equivale a VRAM y que el runtime, la caché KV y la memoria de trabajo añaden requisitos propios.
- VRAM total del sistema: depende del modelo objetivo Qwen3.8 27B, que domina el consumo; el draft añade una fracción sobre el target.
- GPU recomendadas: no especificadas por el autor; en la práctica, el target de 27B requiere GPUs de clase A100/H100 o varias consumer de gama alta, y el draft se suma a ese presupuesto.
- Cabe en GPU consumer: el draft por sí solo sí (3,85 GB), pero la configuración completa target + draft no está documentada para GPUs consumer.
- Opciones de despliegue: SGLang y vLLM (mencionados por el publicador); la model card indica que Mango lo usó con el target MLX4 a través de TensorFold.
- Latencia y throughput: no disponibles para estos archivos exactos; las tablas de acceptance length y throughput del publicador corresponden a sus propias configuraciones.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables de la misma categoría (draft models de decodificación especulativa) en la información proporcionada. La model card menciona otros esquemas como MTP (multi-token prediction) y EAGLE en el contexto de configuraciones relacionadas, pero no ofrece una tabla comparativa directa con parámetros, contexto, rendimiento y licencia de cada alternativa. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: no puede usarse para chat, generación directa ni tareas de razonamiento sin un modelo objetivo compatible.
- Requiere un runtime que soporte DFlash2 y el modelo target exacto; la compatibilidad no es universal entre motores de inferencia.
- La revisión de pesos está fijada (`e383e96a1ac8822a9012a57d43c40d488993a7ad`); usar otra revisión puede invalidar la verificación de integridad.
- No se publica puntuación de calidad independiente; cualquier métrica de rendimiento pertenece a la configuración completa y no es trasladable a otros targets.
- Riesgo de deriva si se cambia la cuantización, el linaje de modificación, el draft, el motor o el tokenizador: la model card advierte que cualquiera de estos cambios puede alterar el resultado.
- Sesgos conocidos: no documentados para este artefacto; los sesgos del sistema final dependen del modelo objetivo.
- Riesgo de alucinación: no aplica directamente al draft, pero la verificación del target determina la calidad final; un borrador mal calibrado puede reducir la tasa de aceptación y anular la ganancia de velocidad.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda conservar la atribución a z-lab y a isilicon/Mango según la procedencia documentada.
- El espejo preserva los bytes de origen sin modificar; no incluye mejoras ni correcciones sobre el modelo original.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/isilicon/mango-dflash2
- Modelo base original: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Colección Mango de modelos probados y espejos: https://huggingface.co/collections/isilicon/mango-tested-models-and-preservation-mirrors-6ae3b73994c895ab42e360d2
- Resultados de evaluación Mango: https://huggingface.co/datasets/isilicon/mango-evaluation-results
- Configuración del artefacto: https://huggingface.co/isilicon/mango-dflash2/resolve/main/config.json
- Pesos safetensors: https://huggingface.co/isilicon/mango-dflash2/resolve/main/model.safetensors
- Modelo consumidor relacionado (Qwen3.8 27B MLX4 OrcaRouter): https://huggingface.co/isilicon/mango-qwen38-27b-uncensored-mlx4
- Configuración Qwen3.8 27B Cyber IQ4_XS: https://huggingface.co/isilicon/mango-qwen27-cyber-iq4xs-mtp
- Configuración Qwen3.8 27B Cyber Q6_K: https://huggingface.co/isilicon/mango-qwen27-cyber-q6k
- Comunidad Infinity en Discord: https://discord.gg/5n5YDbQCMy
