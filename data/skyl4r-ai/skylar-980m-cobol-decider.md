# Skyl4r-Ai/Skylar-980M-Cobol-Decider

## Resumen

Skylar-980M-Cobol-Decider es un modelo de decision tipada ("System One") desarrollado por Skyl4r-Ai (A. Ivanovitch, SKYL4R) para responder preguntas cerradas sobre programas COBOL con probabilidades calibradas. No es un modelo generativo de texto: lee un programa COBOL y su entrada estandar, y responde cuestiones del tipo "que imprime este programa" eligiendo entre una respuesta correcta y hasta tres distractores plausibles, siguiendo el esquema del API Jev de TypeSafe AI. Es el tronco de Skylar-980M-Cobol-Base, un transformer entrenado al 100% desde cero, al que se le anade una cabeza de decision y se afina durante 66 minutos en una unica RTX 4090.

El modelo se publica como investigacion transparente dentro del framework Skylar, no como modelo de proposito general ni como estado del arte. Tiene 1.020.170.497 parametros (tronco de 980M mas cabeza de decision) y un limite de 1.536 tokens por pregunta, truncando el inicio del programa si este es mas largo. Su valor practico reside en servir como verificador barato, filtro o senal de recompensa para COBOL generado, con calibracion explicita mediante una temperatura ajustada sobre preguntas retenidas.

Su relevancia actual esta en el nicho de la verificacion de codigo legacy: en lugar de generar COBOL, comprueba si la salida esperada de un candidato es plausible, algo que los generalistas de tamano similar no logran sin entrenamiento especifico. El modelo es honesto respecto a sus limites: acierta en la tarea de salida (0,836) pero esta al azar (0,49) en la de equivalencia entre programas, que requiere razonamiento de mayor complejidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nano-transformer entrenado desde cero (tronco Skylar-980M-Cobol-Base) mas cabeza de decision |
| Parametros totales | 1.020.170.497 (980M de tronco + cabeza de decision) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 1.536 tokens por pregunta (los programas mas largos se truncan conservando el inicio) |
| Tipos de cuantizacion | bf16 safetensors en publicacion; cargado en fp32 con autocast bf16 del tronco en CUDA; no se documentan otras cuantizaciones |
| Idiomas soportados | code, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer tipo "nano" entrenado desde cero, sin destilacion ni modelo profesor. Sobre el tronco Skylar-980M-Cobol-Base se anade una cabeza de decision especifica para tareas tipadas. El modelo no produce texto libre: dada una entrada con estado (programa COBOL y stdin) y una pregunta con un tipo definido, devuelve probabilidades calibradas sobre las opciones candidatas y una eleccion con su nivel de confianza. El contexto util es de 1.536 tokens por pregunta; aproximadamente el 0,4% del conjunto de test supera ese limite y se trunca.

Los datos de entrenamiento se construyeron a partir de traducciones propias de COBOL a Python, cada una verificada por ejecucion (misma salida para la misma entrada que el programa COBOL bajo GnuCOBOL). Para cada programa se generan mutantes de la traduccion Python con un literal entero cambiado, de modo que un mutante que imprime otra cosa produce una respuesta erronea pero plausible. Se recopilaron 11.083 preguntas de entrenamiento provenientes de 6.400 programas (1.662 retenidos para calibracion) y 2.757 preguntas de test de 1.600 programas nunca vistos. El afinado consistio en 9.421 preguntas por 3 epocas con AdamW, tasas de aprendizaje de 2,5e-5 (tronco) y 1e-4 (cabeza), batch 16 y bf16, durante 66 minutos en una RTX 4090. La calibracion se realizo con una unica temperatura de 2,379 ajustada sobre 1.662 preguntas retenidas. No se documenta uso de RLHF ni DPO.

## Capacidades

- Respuesta a preguntas tipadas sobre programas COBOL con probabilidades calibradas, no generacion de texto libre.
- Tarea "output" (tipo `choice`): dado un programa COBOL y su stdin, elegir la salida correcta entre la verdadera y hasta 3 salidas de programas mutantes plausibles, mezcladas.
- Tarea "equivalent" (tipo `noul`): dado un stdin, un programa COBOL y un programa Python (traduccion verdadera o mutante), decidir equivalencia; el rendimiento medido es de 0,49, al nivel del azar.
- Salida estructurada en el esquema del API Jev de TypeSafe AI, con probabilidades, eleccion y confianza.
- Calibracion de confianza mediante temperatura (ECE 0,019 tras el ajuste en la tarea "output").
- Interfaz de linea de comandos y servidor HTTP: `skylar serve` con endpoint `POST /v1/decide`.
- No soporta tool calling, function calling ni agentes multi-paso segun la informacion disponible.
- No dispone de capacidades de vision, audio ni modo "thinking".
- Capacidad multilingue limitada a code y en segun los metadatos del modelo.

## Casos de uso

- Verificador barato de COBOL generado: dado un candidato de codigo y su entrada esperada, el modelo evalua si la salida prevista es plausible, actuando como comprobador rapido antes de ejecutar en un pipeline.
- Filtro o senal de recompensa en RL: las probabilidades calibradas pueden usarse como recompensa para descartar candidatos generados por modelos mayores que producen salidas poco plausibles.
- Escalado a revision humana cuando la confianza es baja: el nivel de confianza del decider permite enrutar automaticamente los casos dudosos a un revisor, reduciendo carga manual.
- Deteccion de traducciones COBOL-Python sospechosas: aunque la tarea de equivalencia esta al azar, el modelo puede usarse como primera criba en combinacion con ejecucion real para priorizar que traducciones auditar.
- Test de regresion sobre codigo legacy: comprobar que tras una modificacion el programa sigue imprimiendo lo esperado, usando la tarea "output" como asercion automatica.
- Clasificacion de salidas en conjuntos de datos de COBOL: etiquetar pares programa-entrada-salida con probabilidades que permitan filtrar ejemplos ruidosos antes de entrenar otros modelos.
- Componente de un sistema mayor de agentes sobre mainframe: integrarse via el endpoint HTTP `POST /v1/decide` como subsistema de decision para preguntas cerradas sobre programas, delegando el razonamiento abierto a otros modelos.
- Analisis de mutaciones y pruebas de mutacion: usar la sensibilidad del modelo a literales cambiados para medir cuanto cambia la probabilidad asignada ante mutantes, ayudando a priorizar casos de prueba.

## Benchmarks y rendimiento

Resultados medidos con los pesos publicados a traves de `pip install skylar` (0.6.0):

| Test | Skylar-980M-Cobol-Decider | Qwen2.5-Coder-1.5B-Instruct, zero-shot |
|---|---|---|
| "output", 1.157 preguntas (azar ~0,3) | 0,836 (ECE 0,019) | 0,359 |
| "output", solo distractores con la misma forma que la salida verdadera, 379 | 0,805 | no disponible |
| "equivalent", 1.600 preguntas (azar 0,5) | 0,49 | 0,50 |

Notas: en la tarea "output" sin calibrar, el modelo es sobreconfiado (ECE 0,101); una temperatura de 2,379 ajustada sobre preguntas retenidas lo lleva a 0,019. La comparacion con Qwen se realiza en modo zero-shot (metodo del arXiv 2609.37647) frente a un modelo entrenado, por lo que el autor advierte que la comparacion no implica superioridad del tronco, sino que un generalista de ese tamano no puede tomar estas decisiones sin entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, alrededor de 2 GB solo para pesos (1,02B parametros); en la practica, el modelo se carga en fp32 y el tronco ejecuta en autocast bf16 en CUDA, por lo que conviene prever margen adicional para activaciones y contexto (estimacion no publicada).
- GPU recomendadas: el afinado se realizo en una unica RTX 4090, por lo que es el minimo razonable documentado; cualquier GPU con al menos 8 GB de VRAM puede alojar el modelo con holgura.
- Cabe en GPU de consumo: si, segun el autor el entrenamiento cupo en una RTX 4090; la inferencia deberia caber tambien en GPUs de gama media con suficiente VRAM.
- Opciones de despliegue: libreria `skylar` (>= 0.6.0) para carga del decider, servidor propio mediante `skylar serve --model Skyl4r-Ai/Skylar-980M-Cobol-Decider --port 8000` con endpoint `POST /v1/decide`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea "output" | Licencia | Formato |
|---|---|---|---|---|---|
| Skylar-980M-Cobol-Decider | 1,02B | 1.536 tokens | 0,836 (ECE 0,019) | Apache-2.0 | safetensors bf16 |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | no disponible en la informacion | 0,359 (zero-shot) | no disponible en la informacion | no disponible en la informacion |

No se dispone de otras alternativas comparables en la informacion proporcionada. El autor solo compara con Qwen2.5-Coder-1.5B-Instruct en modo zero-shot, por lo que la comparativa directa debe tomarse con cautela: se trata de un modelo especializado y entrenado frente a un generalista sin ajuste.

## Limitaciones y advertencias

- Version beta, publicada como investigacion transparente: un solo tamano, una sola semilla. No es un modelo de proposito general ni estado del arte.
- No genera texto: solo responde preguntas cerradas con opciones candidatas. No predice cadenas libres.
- La tarea de equivalencia entre dos programas es practicamente azar (0,49 frente a 0,5 de azar): no debe usarse para determinar equivalencia real sin ejecucion.
- Limite de contexto de 1.536 tokens por pregunta; los programas mas largos se truncan conservando el inicio (el 0,4% del test afectado).
- Idioma limitado a code y en segun los metadatos; no hay soporte multilingue natural.
- Riesgo de alucinacion y sobreconfianza si no se aplica la temperatura de calibracion: sin ella, ECE sube a 0,101.
- No se documentan sesgos especificos; al entrenar sobre traducciones propias verificadas por ejecucion, la calidad depende de la fidelidad de esas traducciones y de la cobertura de programas COBOL empleados.
- Licencia Apache-2.0, sin restricciones conocidas para uso comercial, aunque el autor la enmarca como investigacion y no ofrece garantias.
- No soporta tool calling ni agentes; su integracion requiere un componente externo que formule las preguntas y gestione el flujo.
- Los datos de benchmark se han medido solo con los pesos publicados a traves de `skylar` 0.6.0; no hay validacion independiente.

## Enlaces

- HuggingFace: https://huggingface.co/Skyl4r-Ai/Skylar-980M-Cobol-Decider
- Modelo base: https://huggingface.co/Skyl4r-Ai/Skylar-980M-Cobol-Base
- Repositorio del framework: https://github.com/skyl4r-ai/skylar
- Codigo del decider: https://github.com/skyl4r-ai/skylar/blob/main/models/decider.py
- Entrenador: https://github.com/skyl4r-ai/skylar/blob/main/training/bin.decide.py
- Referencia citada (metodo zero-shot de Qwen): arXiv 2609.37647 (no verificable en la informacion disponible)
- API Jev de TypeSafe AI: no disponible (mencionada en la model card sin enlace directo)
