# djduecaster/dfreq-sock-heist

## Resumen

Sock Heist es un ajuste fino de la política de locomoción Microduck de Pollen Robotics, publicado por el usuario djduecaster en Hugging Face. No se trata de un modelo de lenguaje, sino de una política de control para un robot cuadrúpedo simulado en MuJoCo: recibe 61 observaciones en coma flotante de precisión simple y emite 14 desplazamientos de posición articular a 50 Hz. Su propósito es específico: mejorar marginalmente el tiempo de finalización en un circuito de evaluación denominado "Sock Heist" modificando la postura de cuello y cabeza durante la fase verde del evento.

El cambio técnico es acotado y explícito: sobre la política original congelada y su normalizador embebido, se añade un sesgo de −0,075 rad a las acciones de cuello y cabeceo (índices 5 y 6) únicamente cuando la observación 48 de comando forward entregado es distinta de cero. No hubo entrenamiento neuronal nuevo; el autor lo describe como una búsqueda de adaptadores acotada. El resultado local reportado es de 22,081 s de media con 5/5 finalizaciones, frente a 22,183 s de la versión anterior, una mejora de 0,102 s.

Es relevante ahora como ejemplo de iteración fina sobre políticas robóticas publicadas con licencia permisiva, y también como caso de estudio de las precauciones metodológicas que acompañan a estas publicaciones: el autor documenta paridad bit a bit entre la implementación Python y el grafo ONNX exportado, advierte de que no reclama mejora de robustez (89/100 finalizaciones en ambos modelos sobre 100 resets) y subraya que se trata de simulación, no de un walker seguro en robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control para robótica; grafo ONNX con normalizador embebido y adaptador de sesgo postural |
| Parametros totales | No disponible (pesos heredados de `alpha_walking.onnx`, 793.705 bytes; el adaptador añade un sesgo fijo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; ventana de observación de 61 valores float32 por paso |
| Tipos de cuantizacion | No disponible (exportación en float32) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`), con ficheros auxiliares `adapter-binding.json`, `export_selected.py` y `SHA256SUMS` |

## Arquitectura y entrenamiento

La política hereda la arquitectura del modelo base `pollen-robotics/microduck-policies` (revisión 665ae4eb20bfe13bca1ef4ea6d4bb6b4a096e448), un walker con normalizador embebido que permanece congelado. Sobre esa base, el autor aplica un gobernador de velocidad de giro ya existente que mapea el comando forward interno según el comando de yaw-rate entregado, y añade en esta versión un sesgo de −0,075 rad sobre las acciones de cuello y cabeceo (índices 5 y 6) condicionado a que la observación 48 (comando forward entregado) sea distinta de cero. La puerta utiliza la observación legal entregada, no un reloj privado ni una tabla de semillas.

No se realizó entrenamiento neuronal nuevo. El autor describe el proceso como búsqueda de adaptadores acotada, seleccionando el candidato tras comparar alternativas. La validación se ejecutó con la revisión de código f6072612b0e40ac613272f88818575b997e820b0, runner v5, MuJoCo 3.10.0, ONNX Runtime 1.24.4 y NumPy 2.4.1. Las acciones exportadas se verificaron bit a bit contra el adaptador Python en cada acción de cinco repeticiones nativas, y 200 comprobaciones aleatorias de observaciones en fase verde y roja dieron error forward cero. Una criba inicial en Python con errores de paridad float32 fue descartada explícitamente como evidencia.

## Capacidades

- Control de locomoción cuadrúpeda simulada: genera 14 offsets de posición articular a 50 Hz a partir de 61 observaciones float32.
- Modulación postural condicionada: aplica el sesgo de cuello y cabeceo solo en fase verde (comando forward distinto de cero), sin residuo en fases roja o de comando cero.
- Gobernador de velocidad de giro: ajusta el comando forward interno en función del yaw-rate entregado.
- Retroalimentación de acción previa veraz: la política mantiene la señal de acción anterior sin alteraciones.
- Exportación ONNX determinista: paridad bit a bit verificada entre Python y ONNX Runtime.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües; es una política de control, no un modelo generativo.

## Casos de uso

- Evaluación de políticas de locomoción en simulación: el modelo sirve como referencia para medir tiempos de finalización en el circuito Sock Heist bajo MuJoCo 3.10.0, con resultados locales reproducibles mediante el runner v5.
- Estudio de adaptadores posturales de bajo coste: permite analizar cómo un sesgo fijo de −0,075 rad en cuello y cabeceo afecta al tiempo de vuelta sin reentrenar la política base.
- Investigación sobre condicionamiento por observación: el uso de la observación 48 como puerta (en lugar de un reloj o tabla de semillas) es un patrón reutilizable para políticas que deben reaccionar a señales del entorno.
- Verificación de paridad Python-ONNX en pipelines de robótica: los scripts `export_selected.py` y `adapter-binding.json` documentan un flujo de exportación con comprobación bit a bit, útil como plantilla para despliegues en ONNX Runtime.
- Docencia y reproducción de experimentos: el repositorio incluye hashes SHA256, NOTICE y verificación de licencia upstream, lo que facilita la auditoría y reproducción del experimento en entornos académicos.
- Análisis de robustez y fallos: los datos de 100 resets (89/100 finalizaciones) permiten estudiar caídas y fallos de captura por el gigante, útiles para investigar límites de políticas walker.
- Base para experimentos de ajuste fino sobre políticas Apache-2.0: al heredar de Microduck con licencia permisiva, puede servir como punto de partida para otras modificaciones acotadas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo medio local oficial (nueva versión) | 22,081 s |
| Tiempo medio local oficial (gobernador previo) | 22,183 s |
| Mejora | 0,102 s |
| Finalizaciones locales | 5/5 |
| Tiempos individuales | 21,840; 23,370; 21,750; 21,485; 21,960 s |
| Comando externo | 1,15 m/s |
| Finalizaciones en 100 resets ampliados (nuevo) | 89/100 |
| Finalizaciones en 100 resets ampliados (antiguo) | 89/100 |
| Subconjunto fresco (starts 21-100, nuevo) | 69/80 |
| Subconjunto fresco (starts 21-100, antiguo) | 70/80 |
| Media combinada con penalización de fallo a 40 s (nuevo) | 24,07510 s |
| Media combinada con penalización de fallo a 40 s (antiguo) | 24,39785 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el fichero `alpha_walking.onnx` heredado pesa 793.705 bytes y el adaptador añade un sesgo fijo, por lo que la huella es mínima y cabe en cualquier GPU consumer.
- GPU recomendadas: no se especifican; al ejecutarse con ONNX Runtime 1.24.4 sobre MuJoCo 3.10.0, cualquier GPU compatible con ONNX Runtime es suficiente. El cuello de botella es la simulación física, no la inferencia.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del grafo.
- Opciones de despliegue: ONNX Runtime (versión validada 1.24.4), MuJoCo 3.10.0 para la simulación, runner v5 del autor.
- Latencia y throughput: no disponibles. La política opera a 50 Hz (periodo de 20 ms), pero no se publican medidas de latencia de inferencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| djduecaster/dfreq-sock-heist (esta versión) | No disponible (ONNX ~794 KB heredados + sesgo) | 61 observaciones float32 | 22,081 s medio local, 5/5; 89/100 resets | Apache-2.0 | Hugging Face |
| djduecaster/dfreq-sock-heist (gobernador previo, rev. f1346106) | No disponible | 61 observaciones float32 | 22,183 s medio local; 89/100 resets | Apache-2.0 | Hugging Face |
| pollen-robotics/microduck-policies (base) | No disponible | 61 observaciones float32 | No disponible en la información proporcionada | Apache-2.0 | Hugging Face |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No se reclama mejora de robustez: sobre 100 resets ampliados, tanto el modelo nuevo como el antiguo finalizan 89/100; en el subconjunto fresco (starts 21-100) el nuevo obtiene 69/80 frente a 70/80 del antiguo.
- Los resultados son locales y no constituyen una recepción del servidor Arena ni una reclamación de ranking.
- El modelo fue seleccionado tras comparar candidatos sobre los mismos datos, por lo que los resultados no deben presentarse como un conjunto de validación final intacto.
- Persisten caídas y fallos de captura por el gigante.
- Se trata de una política específica del evento en simulación, no de un walker generalmente seguro.
- No se garantiza frenado ni estabilidad en robot físico; la inspección visual de hojas de geometría de colisión no establece causalidad de fuerzas de contacto ni seguridad física.
- La inspección visual de las cinco finalizaciones oficiales no demuestra causalidad de contacto.
- La criba original en Python sin corregir contenía errores de asociación y paridad float32 y queda excluida como evidencia aceptada.
- Los inicios oficiales estuvieron expuestos durante la selección.
- No se incluyen mallas ni políticas de competidores separadas.
- Licencia Apache-2.0 heredada del modelo upstream, con verificación en `LICENSE` y `upstream-license-verification.json`; el crédito corresponde a Pollen Robotics y a los contribuidores originales, sin implicación de respaldo.
- Solo simulación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djduecaster/dfreq-sock-heist
- Modelo base: https://huggingface.co/pollen-robotics/microduck-policies/tree/665ae4eb20bfe13bca1ef4ea6d4bb6b4a096e448
- Versión anterior del gobernador: https://huggingface.co/djduecaster/dfreq-sock-heist/tree/f1346106465efafb8b8ada1bedad5395d7794769
- Ficheros de evaluación y exportación en el repositorio: `evaluation.json`, `export_selected.py`, `adapter-binding.json`, `SHA256SUMS`, `NOTICE`, `policy.onnx.NOTICE.txt` (disponibles en la raíz del repositorio de Hugging Face)
