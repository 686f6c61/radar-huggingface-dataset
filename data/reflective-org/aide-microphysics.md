# reflective-org/AIDE-Microphysics

## Resumen

AIDE-Microphysics es un conjunto de pesos de emuladores neuronales para la microfísica de aerosoles de sulfato del modelo TOMAS, desarrollado por reflective-org como parte de la pila de emulación climática AIDE (Aerosol Injection Deployment Emulator). El modelo sustituye la integración numérica de la microfísica seccional de sulfato (40 bins de duplicación de masa, de 1,7 nm a ~10 µm) por un operador aprendido que predice la evolución del estado del aerosol en pasos de 6 horas. Su relevancia radica en que permite acelerar simulaciones de inyección de aerosoles estratosféricos (SAI, stratospheric aerosol injection), una técnica de geoingeniería solar que requiere integraciones climáticas largas y costosas.

El repositorio contiene tres variantes: un transformer de tokens de bin de 7,16 M de parámetros (d384 x 6) como opción autónoma por defecto, una versión reducida de 2,15 M (d256 x 4) para priorizar velocidad, y un estudiante PackTF de 2,1 M entrenado para el modelo acoplado AIDE-SAI. No es un modelo de lenguaje: es un emulador científico de dominio específico, entrenado con salidas del modelo de caja TOMAS-JAX y estados de una simulación CESM2.2 WACCM-CARMA de junio de 1991 que incluye la erupción del Pinatubo.

La arquitectura es un transformer específicamente adaptado a datos de aerosol, con normalización compartida y proyección de salida que impone consistencia de dos momentos y conservación de azufre. La licencia MIT facilita su reutilización en investigación y desarrollo, aunque su ámbito de aplicación está estrictamente limitado a la estratosfera y alta troposfera con aerosoles de sulfato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de tokens de bin (bin-token transformer); variante PackTF student para el modelo acoplado |
| Parametros totales | 7,16 M (bintf_d384); 2,15 M (bintf_d256); 2,1 M (cs_b) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto textual; opera sobre estado por caja y forzamiento en rejilla de 30 min) |
| Tipos de cuantizacion | fp16 y fp32 recomendados; bf16 no recomendado (amplía las colas de error a 14 días) |
| Idiomas soportados | No disponible (no es un modelo lingüístico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt` con `{"model": state_dict}`); normalización en `norm_stats.npz` |

## Arquitectura y entrenamiento

El modelo es un transformer que tokeniza el estado por caja (40 bins de número y masa, más H2SO4 y SO2 en una caja de 1 m³) y el forzamiento a 6 horas sobre una rejilla de 30 minutos (presión, temperatura, humedad relativa y OH). La salida se proyecta con `project="chem"`, que impone consistencia de dos momentos y conservación de azufre. La arquitectura concreta está definida en `aide_micro/schemes/tomas40/models.py` del repositorio de código. La variante `cs_b` es un estudiante PackTF destilado para el modelo acoplado AIDE-SAI, que ejecuta física TOMAS solo en el 0,3 % superior de celdas con mayor cambio esperado.

El entrenamiento se basa en ejecuciones del modelo de caja TOMAS-JAX de entre 6 horas y 14 días. La mayoría parten de celdas reales de una simulación CESM2.2 WACCM-CARMA de junio de 1991, que incluye la erupción del Pinatubo (SO2 inyectado el 1991-06-15) con sobremuestreo de celdas de penacho. Las ejecuciones de inyección estratosférica añaden pulsos de SO2 muestreados (1 ppbv – 1000 ppmv) o inyección continua sobre esos estados. Un conjunto separado usa distribuciones lognormales sintéticas y entornos sintéticos para evitar dependencia de las formas de distribución de CARMA o de las condiciones de junio de 1991. No se especifica en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO (no aplicables a este dominio).

## Capacidades

- Emulación de la evolución temporal de aerosoles de sulfato en pasos de 6 horas: predice número y masa por bin (40 bins), H2SO4 y SO2.
- Integración en cadenas multi-día: estable hasta 14 días en las variantes autónomas, con error mediano de N del 3,1 % y de M del 2,6 % a 6 horas para `bintf_d384`.
- Conservación de azufre y consistencia de dos momentos garantizadas por la proyección de salida `project="chem"`.
- Soporte de forzamiento variable en rejilla de 30 minutos (P, T, RH, OH).
- Modo acoplado: `cs_b` permite ejecutar el modelo AIDE-SAI con física TOMAS solo en celdas seleccionadas (top 0,3 %).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso genérico ni capacidades multilingües; es un emulador científico de dominio específico.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Emulación de microfísica de sulfato en simulaciones de inyección estratosférica: el modelo sustituye la integración numérica de TOMAS en cada paso de 6 horas, permitiendo ejecutar experimentos de SAI de varias semanas con un coste computacional muy inferior al de la física completa.
- Aceleración de estudios de sensibilidad de erupciones volcánicas: partiendo de estados tipo Pinatubo, se pueden simular distintos pulsos de SO2 (1 ppbv – 1000 ppmv) y evaluar la respuesta del aerosol con cadenas de 14 días.
- Prototipado rápido de escenarios de geoingeniería: la variante `bintf_d256` (1,1 µs/celda en fp16 sobre H200) permite barridos amplios de parámetros antes de lanzar simulaciones de física completa.
- Integración en el modelo acoplado AIDE-SAI: `cs_b` se usa para ejecutar TOMAS solo en las celdas con mayor cambio esperado, reduciendo el coste del acoplamiento con una desviación de N del −0,8 %, AOD del +0,2 % y H2SO4 del +1,4 % a 15 días frente a física completa.
- Validación y calibración de esquemas de microfísica: los pesos sirven como referencia rápida para comparar implementaciones de TOMAS o de esquemas seccionales en modelos de caja.
- Generación de datasets sintéticos de aerosol para entrenamiento de modelos posteriores: el emulador puede producir trayectorias de estado de aerosol a bajo coste para aumentar datos de entrenamiento.
- Investigación en emulación neuronal de procesos físicos: el diseño bin-token con proyección conservativa es un caso de estudio para quienes desarrollan emuladores con restricciones físicas.

## Benchmarks y rendimiento

Los datos disponibles en la model card son métricas de error del propio modelo, no benchmarks estándar comparables entre filas (el autor advierte que no son comparables entre sí):

| Variante | Params | Error N a 6 h (mediana) | Error M a 6 h (mediana) | Throughput (fp16, H200) | Estabilidad |
|---|---|---|---|---|---|
| `bintf_d384` | 7,16 M | 3,1 % | 2,6 % | 2,9 µs/celda | Estable en cadenas de 14 días |
| `bintf_d256` | 2,15 M | ~1,5–2 puntos peor | ~1,5–2 puntos peor | 1,1 µs/celda | No especificado |
| `cs_b` | 2,1 M | No validado en autónomo | No validado en autónomo | No disponible | Acoplado: 15 días vs física completa, N −0,8 %, AOD +0,2 %, H2SO4 +1,4 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: muy baja; con 7,16 M de parámetros, el modelo en fp32 ocupa ~29 MB y en fp16 ~14 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: H200 para el rendimiento reportado (2,9 µs/celda en `bintf_d384`); cualquier GPU con soporte PyTorch (RTX 4090, A100, etc.) es suficiente.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos ~1 GB de VRAM libre, incluidas GTX 1650 o superiores.
- Opciones de despliegue: PyTorch nativo mediante el paquete `aide_micro` (`emulator.load("bintf_d384")`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 2,9 µs/celda (fp16, H200) para `bintf_d384`; 1,1 µs/celda para `bintf_d256`. No se reportan cifras para `cs_b`.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de emulación de microfísica de aerosoles de sulfato con características equiparables (mismo tamaño, misma tarea o misma licencia).

## Limitaciones y advertencias

- Solo modela aerosoles de sulfato; no cubre otros tipos de aerosol.
- Solo opera en pasos de 6 horas; no es un integrador de paso variable.
- Entrenado para la estratosfera y la alta troposfera; la precisión fuera de estas condiciones (otras estaciones, contaminación troposférica, aerosoles no sulfatados) no ha sido probada.
- El error crece en cadenas multi-día: en el día 14, el error p90 de N es ~70 %; para ejecuciones acopladas largas se recomienda usar `cs_b` con física TOMAS en las celdas de mayor cambio.
- Los números reportados provienen de protocolos de evaluación propios de cada modelo y no son comparables entre filas.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de predicciones físicamente inconsistentes fuera del dominio de entrenamiento.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento fuera de las condiciones documentadas.
- No se especifican sesgos en el sentido estadístico; la dependencia de las condiciones de junio de 1991 se mitiga parcialmente con el conjunto sintético, pero no se cuantifica su cobertura.
- bf16 no recomendado: amplía las colas de error a 14 días.

## Enlaces

- Hugging Face: https://huggingface.co/reflective-org/AIDE-Microphysics
- Repositorio de código, interfaz y documentación: https://github.com/reflective-org/AIDE-Microphysics
- Documentación de modelos: `docs/MODELS.md` en el repositorio de código
- No se han encontrado otros enlaces (papers, blogs, demos) en la información proporcionada.
