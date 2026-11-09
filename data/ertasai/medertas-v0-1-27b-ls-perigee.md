# ErtasAI/MedErtas-v0.1-27B-LS-Perigee

## Resumen

MedErtas-v0.1-27B-LS-Perigee es un modelo "drafter" (borrador) especializado para decodificacion especulativa, desarrollado por Ertas AI como complemento de su modelo principal MedErtas-v0.1-27B-LS, un modelo medico de 27B basado en Qwen3.8. No es un modelo generativo autonomo: su funcion es proponer tokens candidatos que el modelo principal verifica en una sola pasada, acelerando la inferencia sin alterar la distribucion de las respuestas finales.

El modelo parte del drafter DSpark de Red Hat para Qwen3.8-27B y se ha entrenado adicionalmente sobre respuestas medicas contra MedErtas-v0.1-27B-LS. Con 1.988.431.617 parametros reales (segun safetensors) y un repositorio de 4,0 GB, emplea 7 tokens de borrador por pasada y se sirve exclusivamente con vLLM 0.32.0 mediante el metodo de decodificacion especulativa DSpark.

Su relevancia es practica: en las mediciones del autor alcanza 207 tokens/s en calculo clinico (frente a 188 del drafter de Red Hat) y 188 tokens/s en respuestas de examen (frente a 179), a costa de un 6% menos de velocidad en registros largos de pacientes. Es una pieza de infraestructura de inferencia, no un modelo para usar de forma aislada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter de decodificacion especulativa (DSpark) sobre Qwen3.8-27B; detalles de capas no disponibles |
| Parametros totales | 1.988.431.617 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible para el drafter (el ejemplo de servicio del modelo principal usa 65536) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el ejemplo de servicio usa KV cache en fp8) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, libreria vllm) |

## Arquitectura y entrenamiento

Perigee es un modelo borrador para decodificacion especulativa: propone varios tokens por delante (7 en la configuracion recomendada) y el modelo principal los valida en una unica pasada, conservando solo los que el propio modelo principal habria generado. De este modo la salida mantiene la distribucion del modelo principal y el drafter solo afecta a la velocidad, no al contenido. La arquitectura interna concreta (numero de capas, dimensiones, atencion) no se detalla en la informacion disponible.

El entrenamiento parte del drafter DSpark de Red Hat para Qwen3.8-27B (RedHatAI/Qwen3.8-27B-speculator.dspark) y se afina sobre respuestas medicas contra MedErtas-v0.1-27B-LS. No se especifican el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El objetivo declarado es que el drafter se acerque a la distribucion del modelo principal en dominio medico, de forma que se acepten mas tokens por pasada.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa con el metodo DSpark en vLLM.
- Aceleracion de la decodificacion del modelo principal MedErtas-v0.1-27B-LS en tareas medicas y clinicas.
- Especializacion en vocabulario y formulaciones del dominio medico (respuestas clinicas y de examen).
- Integracion con el parser de razonamiento qwen3 y el parser de tool calling qwen3_coder a traves de la configuracion del modelo principal.
- No genera texto de forma autonoma; no dispone de capacidades propias de vision, audio ni agentes.
- Soporte linguistico limitado al ingles.

## Casos de uso

- Servicio de un asistente clinico de baja latencia: desplegar MedErtas-v0.1-27B-LS con Perigee como drafter para reducir el tiempo por token en respuestas de calculo clinico, donde el autor mide 207 tokens/s frente a 188 con el drafter de Red Hat.
- Respuesta a preguntas de examen medico: en escenarios de preguntas y respuestas tipo examen, Perigee ofrece 188 tokens/s frente a 179 del drafter base, adecuado para plataformas de formacion medica con interaccion conversacional.
- Evaluacion interactiva de casos clinicos: la aceleracion en calculo clinico permite iterar rapidamente sobre escenarios con muchos calculos y dosis, manteniendo la distribucion de salida del modelo principal.
- Despliegue en una unica GPU RTX PRO 6000: el ejemplo del autor muestra el servicio completo (modelo principal mas drafter) en una sola tarjeta con vLLM 0.32.0, util para entornos de investigacion con hardware limitado.
- Prototipado de pipelines medicos con tool calling: al combinarse con el parser qwen3_coder del modelo principal, permite construir asistentes que invocan funciones (calculadoras, bases de datos) con menor latencia percibida.
- Benchmarking interno de decodificacion especulativa: sirve como referencia para comparar estrategias de drafting en dominio medico frente al drafter generico de Red Hat y frente a la prediccion multi-token integrada del modelo principal.

## Benchmarks y rendimiento

Mediciones del autor con MedErtas-v0.1-27B-LS como modelo principal, 7 tokens de borrador, una RTX PRO 6000 y vLLM 0.32.0 (octubre de 2026). Velocidad de decodificacion por usuario, en tokens de salida por segundo:

| Drafter | Registros largos de pacientes | Calculo clinico | Respuestas de examen |
|---|---|---|---|
| Drafter DSpark de Red Hat | 241 | 188 | 179 |
| Perigee | 227 | 207 | 188 |

Perigee es un 10% mas rapido en calculo clinico y un 5% mas rapido en respuestas de examen para un solo usuario, y un 6% mas lento en registros largos de pacientes. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es coherente con la naturaleza del modelo: un drafter no altera la calidad de las respuestas del modelo principal.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 4,0 GB en safetensors; el drafter se carga junto al modelo principal, por lo que la VRAM total depende de este ultimo.
- GPU recomendadas: el autor mide en una RTX PRO 6000; no se especifican otras GPU validadas.
- Cabe en GPU de consumo: no confirmado; el requisito conjunto (modelo principal de 27B mas drafter) excede la VRAM de la mayoria de GPU de consumo.
- Opciones de despliegue: exclusivamente vLLM 0.32.0 con decodificacion especulativa DSpark (configuracion `{"method":"dspark","model":"ErtasAI/MedErtas-v0.1-27B-LS-Perigee","num_speculative_tokens":7}`). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 227-207-188 tokens/s por usuario segun la tarea (ver tabla de benchmarks); no se proporcionan datos de throughput agregado multiusuario, aunque el autor indica que con muchos usuarios el modelo principal con prediccion multi-token ofrece el mayor rendimiento total en calculo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedErtas-v0.1-27B-LS-Perigee | Drafter DSpark medico | 1.988.431.617 | Especializado en respuestas medicas | Apache 2.0 | Hugging Face (vLLM) |
| RedHatAI/Qwen3.8-27B-speculator.dspark | Drafter DSpark generico | no disponible | Drafting general para Qwen3.8-27B | Apache 2.0 | Hugging Face |
| MedErtas-v0.1-27B-LS | Modelo principal | 27B (nominal) | Generacion medica | no disponible en la informacion | Hugging Face |

Frente al drafter de Red Hat, Perigee gana en calculo clinico y respuestas de examen pero pierde en registros largos de pacientes. Frente a la prediccion multi-token integrada del modelo principal, el autor indica que esta ultima rinde mejor en throughput total con muchos usuarios concurrentes en calculo. No se dispone de comparaciones con otros drafters medicos de terceros.

## Limitaciones y advertencias

- No es un modelo generativo autonomo: no debe usarse para producir texto por si mismo; las limitaciones y el uso previsto del modelo principal MedErtas-v0.1-27B-LS se aplican en su totalidad.
- La compatibilidad solo esta medida con MedErtas-v0.1-27B-LS; emparejarlo con Qwen3.8-27B en BF16, otras builds de 4 bits o versiones posteriores de MedErtas no esta medido.
- Cada version de MedErtas incluye su propio drafter y los numeros de version avanzan conjuntamente; mezclar versiones puede degradar la tasa de aceptacion.
- Rendimiento inferior al drafter de Red Hat en registros largos de pacientes (227 frente a 241 tokens/s), por lo que para trafico dominado por historiales largos el autor recomienda el drafter de Red Hat.
- Entrenado sobre respuestas medicas generales; un drafter afinado con datos propios del producto puede ajustarse mejor a la distribucion de salida.
- Solo soporta ingles.
- Riesgo de alucinacion heredado del modelo principal: al no alterar la distribucion de salida, el drafter no corrige ni agrava los sesgos del modelo principal, pero tampoco los mitiga.
- Licencia Apache 2.0 (heredada del drafter de Red Hat), permisiva para uso comercial; verificar las condiciones del modelo principal para el despliegue conjunto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ErtasAI/MedErtas-v0.1-27B-LS-Perigee
- Modelo principal: https://huggingface.co/ErtasAI/MedErtas-v0.1-27B-LS
- Modelo base (drafter de Red Hat): https://huggingface.co/RedHatAI/Qwen3.8-27B-speculator.dspark
- Whitepaper: https://www.ertas.ai/research/medertas-v01-specialisation-inference-optimisation
- Pagina del modelo en Ertas AI: https://www.ertas.ai/medertas
- Colecciones de ErtasAI en Hugging Face: https://huggingface.co/collections/ErtasAI
- Contacto empresarial: https://www.calendly.com/hello-ertas/enterprise
