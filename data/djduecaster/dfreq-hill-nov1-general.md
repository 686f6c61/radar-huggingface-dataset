# djduecaster/dfreq-hill-nov1-general

## Resumen

dfreq-hill-nov1-general es un controlador de locomocion para robot cuadrupedo simulado, publicado por el usuario djduecaster en Hugging Face. No es un modelo de lenguaje: se trata de un artefacto de calibracion derivado por fine-tuning del modelo de referencia pollen-robotics/microduck-hill-climb-1m5-reference, orientado a la competicion de controladores Hill del ecosistema microduck. El modelo recibe 61 observaciones en float32 y emite 14 acciones en float32 expresadas como offsets en radianes, a una frecuencia de control de 50 Hz.

La relevancia tecnica del artefacto radica en su metodo: no se ha reentrenado la red neuronal, sino que se ha aplicado una calibracion sin derivadas (derivative-free) sobre la fisica nativa del simulador, manteniendo congelados los backbones neuronales heredados. Sobre esa calibracion se anade una segunda mezcla conservadora que utiliza la gravedad y la velocidad angular entregadas por el simulador para limitar la desviacion respecto al controlador incumbente a un maximo del 3 % de la diferencia de accion.

El modelo esta pensado exclusivamente para simulacion. El propio autor advierte de que no debe usarse en un robot fisico ni como caminante general, y que el recorte positivo de comandos heredado implica que un comando cero no constituye una parada validada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su licencia no esta declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Controlador neuronal con backbones congelados (microduck) mas capa de calibracion derivada de la fisica del simulador |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (controlador reactivo; ventana de observacion de 61 valores float32) |
| Tipos de cuantizacion | no disponible (pesos exportados en ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 float32 |
| Dimension de accion | 14 float32 (offsets en radianes) |
| SHA256 | 4124ba296a4ce261847c4a6bf0cbca8e7f81abe7ed28c4bc3a212bd1d2018a32 |

## Arquitectura y entrenamiento

El artefacto hereda los backbones neuronales del modelo de referencia pollen-robotics/microduck-hill-climb-1m5-reference, que permanecen congelados. Sobre ellos se aplica una calibracion sin derivadas (derivative-free) sobre la fisica nativa del simulador, que aprende un controlador continuo rapido. Una segunda mezcla, seleccionada de forma independiente y de caracter conservador, utiliza la gravedad entregada y la realimentacion de velocidad angular para aplicar como maximo el 3 % de la diferencia de accion del controlador calibrado respecto al incumbente.

El autor explicita que este proceso es calibracion y optimizacion, no un nuevo entrenamiento neuronal con PPO. No se emplea nueva semilla, reloj, horario, posicion global ni busqueda por huella de observacion (observation-fingerprint lookup). No se documentan en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, que en cualquier caso no aplican a este tipo de controlador.

## Capacidades

- Generacion de acciones de control de locomocion para robot cuadrupedo simulado: 14 salidas float32 como offsets en radianes a 50 Hz.
- Consumo de observaciones de 61 valores float32 por paso de control.
- Controlador continuo rapido obtenido por calibracion sobre fisica nativa, sin reentrenamiento de los backbones.
- Mezcla conservadora guiada por gravedad y velocidad angular, con desviacion acotada al 3 % respecto al incumbente.
- Ejecucion en el simulador oficial del ecosistema microduck con comandos de velocidad positiva.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues, por no ser un modelo de lenguaje.

## Casos de uso

- Evaluacion comparativa en la competicion Hill de microduck: el modelo puede enfrentarse al incumbente en barridos pareados sobre el simulador oficial para medir ganancia de tiempo hasta finalizacion, con intervalos bootstrap sobre finalizadores compartidos.
- Calibracion de controladores existentes sin reentrenar: sirve como ejemplo de metodologia para aplicar ajustes derivados de la fisica del simulador sobre un backbone congelado, limitando la desviacion respecto al controlador de referencia.
- Pruebas de robustez ante comandos de velocidad: los conjuntos de estres a comandos 0,55 y 0,65 permiten evaluar la tasa de finalizacion bajo condiciones de comando exigentes en simulacion.
- Investigacion en optimizacion sin derivadas aplicada a robotica: el artefacto documenta un flujo completo de calibracion derivative-free con validacion estadistica pareada.
- Referencia para auditoria de linaje de modelos: el repositorio incluye credito de pesos heredados en upstream-base-card.md y un SHA256 verificable, util para trazabilidad en pipelines de investigacion.
- Docencia y experimentacion en simulacion: permite estudiar el efecto de mezclas conservadoras con realimentacion de estado sobre el comportamiento de un controlador de marcha, siempre dentro del simulador.

## Benchmarks y rendimiento

Los datos disponibles son mediciones del autor en el simulador oficial, no benchmarks estandarizados de terceros.

| Metrica | Resultado |
|---|---|
| Barrido oficial nativo sin cambios (local) | 3,842 s, 5/5 finalizaciones con comando 0,6 |
| Referencia historica publicada | 3,889 s |
| Arranques pareados frescos | 256 |
| Finalizaciones candidato vs incumbente | 254 vs 253 |
| Finalizaciones perdidas | 0 |
| Rescates | 1 |
| Ganancia media en finalizadores compartidos | 0,039743 s |
| Intervalo bootstrap del 95 % (finalizadores compartidos) | [0,03432806324110671, 0,04513833992094861] |
| Estres de comando a 0,55 y 0,65 (32 arranques por conjunto) | 63 finalizaciones candidato vs 62 incumbente |
| Finalizaciones perdidas en estres | 0 |

El autor aclara que la evidencia de muestra finita no constituye una garantia universal de seguridad y que no se reclama ningun resultado de servidor ni asignacion de puntos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio es de 0,0 GB y no se publican recuentos de parametros.
- GPU recomendadas: no disponibles. Por la naturaleza del artefacto (controlador a 50 Hz con observaciones de 61 float32), la inferencia es de baja exigencia y probablemente viable en CPU, aunque no se documenta.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: exportacion ONNX y libreria microduck, segun las etiquetas del repositorio. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el unico requisito temporal documentado es la frecuencia de control de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dfreq-hill-nov1-general | Controlador calibrado sobre microduck | no disponible | no aplica | 3,842 s en barrido local; 254/256 finalizaciones pareadas | no disponible | Hugging Face, 0 descargas |
| pollen-robotics/microduck-hill-climb-1m5-reference | Controlador de referencia (base) | no disponible | no aplica | 3,889 s historico publicado | no disponible | Hugging Face (modelo base) |
| Otros controladores Hill de microduck | Controladores de robotica | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo simulacion: el autor prohibe explicitamente su uso en un robot fisico o como caminante general.
- El recorte positivo de comandos heredado implica que un comando cero no es una parada validada.
- La calibracion no reentrena los backbones neuronales; las mejoras proceden de ajustes sobre la fisica del simulador y pueden no transferir fuera de ella.
- La mezcla conservadora limita la desviacion al 3 % respecto al incumbente, lo que acota la ganancia alcanzable.
- La evidencia estadistica es de muestra finita (256 arranques pareados y dos conjuntos de 32 arranques) y no constituye garantia universal de seguridad.
- No se reclama ningun resultado de servidor ni asignacion de puntos en la competicion.
- Licencia no declarada: no hay autorizacion explicita para uso comercial y la calibracion no relicencia el material heredado.
- El modelo base conserva sus propios terminos; los pesos neuronales originales no se han modificado.
- No dispone de capacidades de lenguaje, vision ni audio; no es apto para tareas de NLP.
- Sin descargas ni likes registrados, lo que limita la validacion independiente por parte de la comunidad.
- Riesgo de alucinacion y sesgos: no aplica en el sentido habitual de modelos de lenguaje, pero no se documenta analisis de sesgo en el comportamiento del controlador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djduecaster/dfreq-hill-nov1-general
- Modelo base: https://huggingface.co/pollen-robotics/microduck-hill-climb-1m5-reference
- Credito de linaje y pesos heredados: upstream-base-card.md (referenciado en la model card del repositorio)
