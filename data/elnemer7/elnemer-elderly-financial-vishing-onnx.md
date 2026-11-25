# elnemer7/ElNeMeR-Elderly-Financial-Vishing-ONNX

## Resumen

ElNeMeR-Elderly-Financial-Vishing-ONNX es un clasificador de texto exportado a formato ONNX, publicado por el desarrollador Mahmoud ElNemer (elnemer7) dentro de su flota de modelos forenses de caracter humanitario. El modelo esta disenado especificamente para detectar intentos de fraude telefonico y por mensajeria dirigidos a personas mayores, en concreto cuatro clases: avisos legitimos de familia o banco, secuestro de OTP bancario o de pension, falsos accidentes de hijos y solicitudes de donativos a organizaciones benemeritas no verificadas. Segun la model card, cubre arabe e ingles.

La relevancia del modelo es acotada pero clara: se trata de una herramienta de nicho orientada a la proteccion de colectivos vulnerables frente a ingenieria social, un problema con impacto economico y humano considerable. El autor lo presenta como parte de una flota de quince modelos forenses y lo vincula a una plataforma de deteccion en vivo.

La informacion publica es muy escasa: el repositorio ocupa 0.0 GB, no declara pipeline, no especifica arquitectura base, numero de parametros, longitud de contexto ni volumen de entrenamiento. La ficha se completa con los datos disponibles y marca explicitamente como no disponible todo lo que la model card no documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo exportado a ONNX; arquitectura base no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX; no se detallan variantes de cuantizacion) |
| Idiomas soportados | arabe e ingles (segun la model card) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Clases de salida | 4 (SAFE_FAMILY_OR_BANK_NOTICE, BANK_PENSION_OTP_HIJACK, FAKE_SON_ACCIDENT_VOICE_SCAM, UNVERIFIED_CHARITY_FRAUD) |
| Tamano del repositorio | 0.0 GB (segun Hugging Face) |
| Fecha de creacion | 2026-11-25 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura subyacente. La model card solo indica que el artefacto distribuido es un modelo ONNX con una cabeza de clasificacion de cuatro clases que emite probabilidades. No se especifica si el backbone es un transformer encoder, un modelo tipo BERT multilingue, una red recurrente o un clasificador ligero; tampoco se documenta el numero de parametros ni la dimension del vocabulario.

Tampoco hay datos sobre el corpus de entrenamiento: no se indica el numero de tokens, la composicion del dataset, si se incluyeron transcripciones reales de llamadas, mensajes SMS o conversaciones de WhatsApp, ni si se aplicaron tecnicas de aumento de datos o ajuste fino supervisado. No se menciona RLHF, DPO ni ningun otro proceso de alineacion, algo esperable en un clasificador. La unica innovacion declarada es de producto, no tecnica: la especializacion en un conjunto cerrado de tipologias de fraude contra mayores en dos idiomas.

## Capacidades

- Clasificacion de texto en cuatro categorias cerradas relacionadas con fraude financiero y telefoni­co contra personas mayores.
- Deteccion de intentos de obtencion fraudulenta de codigos OTP de banca o pension (BANK_PENSION_OTP_HIJACK).
- Deteccion de suplantacion de identidad de hijos con falsos accidentes o emergencias (FAKE_SON_ACCIDENT_VOICE_SCAM).
- Deteccion de solicitudes de donativos a organizaciones benemeritas no verificadas (UNVERIFIED_CHARITY_FRAUD).
- Distincion de comunicaciones legitimas de familia o entidades bancarias (SAFE_FAMILY_OR_BANK_NOTICE).
- Soporte declarado de arabe e ingles.
- Salida de probabilidades por clase, apta para umbrales de decision configurables.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni comportamiento agentico.

## Casos de uso

- Filtrado de SMS y mensajes de mensajeria instantanea: el clasificador puede puntuar mensajes entrantes en un telefono o en una pasarela de operador y marcar como sospechosos aquellos con alta probabilidad en las clases de fraude antes de que el usuario los lea.
- Aviso en tiempo real en aplicaciones de banca movil: integrado en el backend, puede analizar notificaciones y mensajes reenviados por el cliente para alertar de patrones de secuestro de OTP o de falsos avisos de pension.
- Moderacion en plataformas de telefonia o VoIP: procesando transcripciones de llamadas, permite generar alertas al operador o al usuario cuando se detecta una conversacion compatible con falso accidente de un hijo.
- Proteccion de personas mayores mediante un asistente familiar: una aplicacion de acompanamiento puede consultar el modelo antes de mostrar un mensaje al usuario y ofrecer una advertencia contextualizada.
- Analisis forense posterior a un incidente: investigadores o fuerzas de seguridad pueden clasificar lotes de mensajes incautados o reportados para priorizar casos de fraude contra mayores.
- Verificacion de campanas solidarias: ONG y plataformas de donaciones pueden usar el modelo como primera capa de triaje para detectar solicitudes de caridad no verificadas en arabe e ingles.
- Despliegue en dispositivos con recursos limitados: al distribuirse en ONNX, puede ejecutarse con ONNX Runtime en entornos de borde, aunque el rendimiento real depende de un backbone no documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0.0 GB y no se detalla el tamano real de los pesos.
- GPU recomendadas: no disponibles; al ser un modelo ONNX de clasificacion, previsiblemente puede ejecutarse en CPU, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada; depende del backbone, que no se documenta.
- Opciones de despliegue: ONNX Runtime es la via natural dada la libreria declarada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que en principio no aplican a un clasificador ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ElNeMeR-Elderly-Financial-Vishing-ONNX | Clasificador ONNX de fraude a mayores | no disponible | no disponible | arabe, ingles | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos directamente comparables en la misma categoria (clasificacion de vishing y fraude financiero contra mayores en arabe e ingles).

## Limitaciones y advertencias

- Documentacion tecnica practicamente inexistente: sin arquitectura, parametros, contexto ni datos de entrenamiento, es dificil evaluar su robustez o reproducir resultados.
- Ausencia total de benchmarks publicados; no hay evidencia cuantitativa de precision, recall ni tasas de falsos positivos.
- Riesgo de sesgo idiomatico y de dominio: el modelo declara arabe e ingles, pero no se especifica la variedad dialectal ni el registro cubierto, lo que puede limitar su eficacia con dialectos arabes regionales.
- Riesgo de falsos negativos en tipologias no contempladas: las cuatro clases son cerradas y no cubren otras formas de fraude (inversiones, romance scam, phishing por correo, etc.).
- Riesgo de falsos positivos en comunicaciones legitimas de familia o banca, especialmente si el texto se parece superficialmente a un aviso de emergencia o a una solicitud de OTP.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; conviene verificar la procedencia y calidad del modelo antes de integrarlo en produccion.
- El modelo se presenta dentro de una flota comercial del autor con enlaces a portales y numeros de contacto; la ficha no valida de forma independiente esas afirmaciones.
- No hay informacion sobre el tratamiento de datos personales ni sobre si el modelo se entreno con conversaciones reales, lo que es relevante para cumplimiento normativo (RGPD, etc.).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Elderly-Financial-Vishing-ONNX
- Plataforma forense en vivo: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
