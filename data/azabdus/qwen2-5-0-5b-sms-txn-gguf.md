# azabdus/qwen2.5-0.5b-sms-txn-GGUF

## Resumen

Qwen2.5-0.5B sms-txn es un ajuste fino (LoRA) del modelo Qwen2.5-0.5B-Instruct de Alibaba, especializado en una tarea muy concreta: extraer como JSON la informacion de transacciones contenida en un unico SMS bancario indio, o devolver `{"is_txn":false}` cuando el mensaje no es una transaccion (OTP, recordatorio de factura, promocion, aviso de entrega). Lo publica el usuario azabdus en Hugging Face bajo licencia Apache 2.0 y solo en formato GGUF, pensado para llama.cpp y las aplicaciones moviles construidas sobre el (Android e iOS).

El modelo resuelve un problema de nicho pero muy practico: la clasificacion y estructuracion automatica de notificaciones bancarias en el movil, en local y sin conexion. Con solo 494 millones de parametros (0,5B), cabe holgadamente en un telefono y produce una salida de unos 30 tokens por mensaje con decodificacion greedy. La version 2026.11.02 mejora la generalizacion a formatos de bancos no vistos respecto a la 2026.10.30, a costa de 0,3 puntos en el conjunto de test original.

No es un modelo de proposito general: es un extractor de informacion de dominio cerrado, en ingles y orientado al mercado indio. Su interes esta en el enfoque de entrenamiento (identidad sintetica por ejemplo, split temporal por fecha) y en el despliegue en dispositivo, no en capacidades conversacionales amplias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajustado con LoRA (r=16, todas las capas lineales) |
| Parametros totales | 494.032.768 (0,5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-0.5B-Instruct; el caso de uso es un unico SMS corto) |
| Tipos de cuantizacion | Q4_0 (recomendada, con matriz de importancia en la version 2026.11.02), Q4_K_M, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors solo como dato del modelo base; el repo publica GGUF) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,5B parametros. Sobre el se aplica un LoRA con r=16 en todas las capas lineales, entrenado durante una sola epoca sobre SMS bancarios indios etiquetados a mano, en una unica GPU T4. La perdida se calcula solo sobre la respuesta (no sobre el prompt), lo que concentra el aprendizaje en el JSON de salida.

Dos decisiones de diseno destacan. Primero, el split de datos es temporal: cada mensaje de test es posterior a todos los de entrenamiento, lo que mide generalizacion a formatos futuros y no solo interpolacion. Segundo, el nombre y los UPI del titular se sustituyen en entrenamiento por una identidad inventada distinta en cada ejemplo, tanto en el SMS como en la respuesta y en la linea `owner:`, con ejemplos adicionales donde la linea `owner:` nombra a otra persona. Asi el modelo aprende a comparar el beneficiario con el titular en lugar de memorizar un nombre concreto, y el nombre real del titular no queda en los pesos. La version 2026.11.02 incorpora ademas ejemplos de formatos de otros bancos y carteras indias, redactados a partir de los tests de parser de PennyWise AI (AGPL-3.0) con importes, nombres y numeros de cuenta nuevos.

## Capacidades

- Extraccion de informacion estructurada: convierte un SMS bancario en un JSON con seis campos (`is_txn`, `direction`, `amount`, `currency`, `merchant`, `is_transfer`).
- Clasificacion binaria de transaccion: distingue un movimiento de dinero real de un OTP, un recordatorio de vencimiento, una promocion o un aviso de entrega.
- Deteccion de direccion: distingue `debit` (dinero que sale) de `credit` (dinero que entra).
- Deteccion de transferencias internas: identifica movimientos entre cuentas del propio titular (pagos a su nombre o UPI, liquidaciones de tarjeta y prestamos, recargas de cartera y broker) mediante la comparacion del beneficiario con la linea `owner:`.
- Prompt de activacion fijo: el system prompt es solo el disparador `sms_txn_v1`; las reglas de etiquetado estan entrenadas en los pesos y no requieren instrucciones.
- Salida compacta: aproximadamente 30 tokens por mensaje con decodificacion greedy.
- No dispone de tool calling, capacidades de agente, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Clasificacion de notificaciones bancarias en el movil: la app envia cada SMS entrante con el system prompt `sms_txn_v1` y obtiene un JSON de seis campos; el modelo cabe en el dispositivo y funciona sin conexion gracias al GGUF Q4_0 optimizado para ARM.
- Registro automatico de gastos: el campo `merchant` y el importe permiten agregar el gasto por comercio; las transferencias internas se excluyen de los totales usando `is_transfer`, evitando duplicar movimientos entre cuentas propias.
- Filtrado de ruido en la bandeja de entrada: los mensajes que devuelven `{"is_txn":false}` (OTP, promociones, avisos de entrega) se descartan o se enrutan a otra categoria sin intervencion del usuario.
- Conciliacion de extractos: procesar en lote los SMS historicos de la carpeta `inbox` para reconstruir un historial de transacciones con direccion, importe y contraparte.
- Alertas de gasto en tiempo real: al detectar un `debit` con importe superior a un umbral, la aplicacion puede disparar una notificacion local; la latencia baja de un modelo de 0,5B en Q4_0 lo hace viable en el propio telefono.
- Privacidad por diseno en finanzas personales: al ejecutarse en local, el texto del SMS (que contiene importes y numeros de tarjeta parciales) no sale del dispositivo, lo que encaja con requisitos de tratamiento de datos financieros.
- Prueba de concepto para otras geografias: el mismo esquema de prompt (titular, remitente, carpeta, texto) y el mismo JSON de salida sirven de plantilla para adaptar el enfoque a otros mercados con un reentrenamiento LoRA similar.

## Benchmarks y rendimiento

Resultados publicados por el autor, con archivos Q4_0 en llama.cpp y decodificacion greedy (mayor es mejor):

| Metrica | 2026.11.02 | 2026.10.30 |
|---|---|---|
| Conjunto de test reservado, exactamente correcto (los seis campos) | 98,2% | 98,5% |
| Formatos de otros bancos: 337 SMS de los tests de parser de PennyWise, coincide en si es transaccion o no | 325 (96,4%) | 288 (85,5%) |
| Cuatro bancos excluidos por completo del entrenamiento: 24 SMS, coincide en si es transaccion o no | 19 | 9 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en Q4_0 y en torno a 1 GB en f16 para un modelo de 0,5B; el repo completo ocupa 3,1 GB por incluir varias versiones y cuantizaciones.
- GPU recomendadas: no requiere GPU dedicada; el entrenamiento se hizo en una unica T4. Para inferencia en servidor basta cualquier GPU moderna, aunque el caso de uso principal es CPU.
- Cabe en GPU de consumo: si, en cualquier GPU consumer, y tambien en CPU de movil y de portatil.
- Opciones de despliegue: llama.cpp y las aplicaciones construidas sobre el (Android e iOS); tambien es compatible con endpoints (tag `endpoints_compatible`). No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no se publican cifras concretas; la salida es de unos 30 tokens por mensaje con decodificacion greedy, y el autor indica que Q4_0 suele ser la cuantizacion mas rapida en Android por el codigo ARM optimizado de llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen2.5-0.5B sms-txn (este) | 0,5B | no disponible | Extraccion de transacciones de SMS indios | Apache 2.0 | GGUF |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | no disponible en la informacion proporcionada | Asistente conversacional general | Apache 2.0 | safetensors, GGUF |
| PennyWise AI (parser de referencia) | no aplica (reglas) | no aplica | Parser de SMS bancarios basado en tests | AGPL-3.0 | codigo |

La comparacion con otros modelos de extraccion de informacion financiera no esta disponible en la informacion proporcionada. Frente a su modelo base, este ajuste sacrifica capacidades generales para ganar precision en una tarea cerrada; frente a un parser de reglas como el de PennyWise, aporta tolerancia a formatos no vistos a cambio de menor determinismo y de depender de pesos.

## Limitaciones y advertencias

- Cobertura limitada de bancos, carteras y comercios indios: los formatos nunca vistos se leen con menos fiabilidad, por lo que conviene validarlo con los SMS de los bancos propios antes de confiar en el.
- Solo procesa mensajes en ingles.
- Sin la linea `owner:`, el campo `is_transfer` no es fiable, porque el modelo no puede saber a quien pertenecen las cuentas.
- Las transferencias reconocibles solo por un patron nuevo (un broker o cartera no visto) suelen escaparse: 10 de 17 en el conjunto de test.
- Riesgo de alucinacion en importes, comercios o direccion si el SMS tiene un formato atipico; la salida es JSON corto y estructurado, lo que facilita validarla con un esquema antes de usarla.
- No se documentan sesgos especificos mas alla del sesgo de dominio (bancos y formatos indios); el anonimizado por identidad sintetica reduce el riesgo de filtrar datos personales del titular.
- Licencia Apache 2.0, que permite uso comercial; no obstante, los ejemplos de entrenamiento derivados de los tests de PennyWise AI (AGPL-3.0) conviene revisarlos si se redistribuye el modelo en un producto propietario.
- El modelo esta pensado para un unico SMS por inferencia; no se documenta comportamiento con conversaciones multi-turno ni con entradas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/azabdus/qwen2.5-0.5b-sms-txn-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- PennyWise AI (tests de parser usados como referencia): https://github.com/sarim2000/pennywiseai-tracker
- llama.cpp: https://github.com/ggml-org/llama.cpp
