# Donghyun1228/pi05-libero-b200-full-probe-fixed-view-large-1000-20261013

## Resumen

Este repositorio contiene un checkpoint de política robótica de visión-lenguaje-acción (VLA) denominado π₀.₅ full-probe fixed1:1:1, variante view_large, publicado por el usuario Donghyun1228 sobre la librería openpi. Se trata de un experimento de dinámica inversa (inverse dynamics modelling, IDM) "target-only" realizado durante 1.000 actualizaciones con lote B32, semilla 42 y semilla de muestreo 170013, partiendo de una inicialización fuente. No es un modelo generalista de lenguaje, sino un artefacto de investigación orientado al control de manipulación robótica sobre el benchmark LIBERO.

El objetivo del experimento es medir el efecto de un ajuste con coeficientes fijos 1:1:1 sobre los módulos de visión, LLM y experto de acciones, sin retroalimentación de éxito de política y sin usar observaciones de la fuente. La evaluación emparejada con semilla 7 reporta 117/400 aciertos (29,25%) sobre cuatro suites × diez tareas × diez estados iniciales oficiales. Frente a la referencia v1 fixed, la variante view_large mejora de 104 a 117/400 (+3,25 puntos porcentuales), mientras que yaw30 empeora de 215 a 201 (-3,50 pp) y ur5e mejora de 164 a 167 (+0,75 pp).

Es relevante ahora porque documenta de forma muy detallada el pipeline de openpi aplicado a LIBERO, incluyendo planificaciones, diarios, registros de controlador y comprobaciones de exportación, lo que facilita reproducir y auditar el experimento. El propio autor advierte que estos cribados de 400 episodios no establecen una mejora general ni sustituyen a la mejor línea base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA sobre el stack openpi π₀.₅, con modulos diferenciados de vision, LLM y experto de acciones |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (43 hojas entrenables de origen) y BF16 (74 hojas en despliegue) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repositorio de 13,1 GB en la libreria openpi) |

## Arquitectura y entrenamiento

El modelo se apoya en la arquitectura π₀.₅ orquestada por openpi, con tres bloques funcionales diferenciados: visión, LLM y experto de acciones. El checkpoint nativo tiene 51 hojas, de las cuales 43 son hojas entrenables originales en FP32 y 8 están congeladas. Para inferencia se anexan 23 hojas de muñeca (source-wrist) que no participan en el entrenamiento, y el despliegue restaura 74 hojas en BF16. El experimento es "target-only": no se usan observaciones de la fuente ni la retroalimentación de éxito de la política como señal de entrenamiento.

El entrenamiento comprende 1.000 actualizaciones sobre el conjunto objetivo libero-dense-contact-sweep-d2 (revisión 9f8f600ce0e8f5df51c0e847c65a1e09f29d8494), con 305.406 ventanas nativas H10 elegibles (10 linajes de tarea por suite, 40 en total). El optimizador extrae 8 ventanas por suite sin reemplazo en cada paso, con balance por suite y no por tarea. Los diagnósticos K4/B8 usan 8 linajes de entrenamiento distintos por suite repartidos en cuatro micro-lotes, y los espacios de nombres RNG de optimizador y diagnóstico son independientes. Los coeficientes de visión, LLM y experto se mantienen fijos en 1/1/1 durante las 1.000 iteraciones (media, mínimo, máximo y valor final registrados como 1,000000). La fórmula y los ajustes del controlador no cambian respecto a v1.

## Capacidades

- Generación de acciones de manipulación robótica mediante formulación de dinámica inversa, orientada al control de políticas sobre LIBERO.
- Procesamiento multimodal con entrada visual (incluidas vistas de muñeca en inferencia) y representación de lenguaje, canalizadas por los bloques de visión y LLM.
- Ejecución de políticas de control sobre entornos MuJoCo 3.2.3 mediante un servidor de políticas con 16 clientes por GPU.
- Diagnóstico interno por módulos (visión, LLM, experto) con registro de multiplicadores por paso de optimizador.
- Exportación reproducible de pesos: planificaciones, diarios, registros de controlador y comprobaciones estrictas de exportación en FP32 nativo y BF16 de despliegue.
- Soporte de tool calling: no disponible.
- Soporte de agentes multi-paso: no disponible en el sentido de agentes de lenguaje; su ámbito es el control robótico por episodio.
- Capacidades multilingües: no disponibles.
- Capacidad especial: experimento de sonda completa (full-probe) con ventana de vista grande (view_large) y coeficientes fijos por módulo.

## Casos de uso

- Investigación en dinámica inversa para robótica: reproducción del experimento target-only de 1.000 actualizaciones sobre LIBERO, con semilla 42 y semilla de muestreo 170013, para analizar el efecto de congelar 8 hojas y anexar 23 hojas de muñeca solo en inferencia.
- Evaluación comparativa de políticas VLA: medición de éxito sobre 400 episodios (cuatro suites × diez tareas × diez estados iniciales) con semilla 7, comparando view_large (117/400), yaw30 (201/400) y ur5e (167/400).
- Auditoría de pipelines openpi: uso de las planificaciones, diarios y registros de controlador incluidos para verificar el entrenamiento y la exportación antes de integrar el checkpoint en un banco de pruebas.
- Análisis de estabilidad de coeficientes: estudio del impacto de mantener los multiplicadores de visión, LLM y experto fijos en 1 en lugar de aplicar ponderaciones variables, con datos por paso de optimizador.
- Pruebas de despliegue de servidor de políticas: configuración de evaluación con 16 clientes por GPU y MuJoCo 3.2.3, útil para validar infraestructura de inferencia robótica antes de escalar a otros conjuntos de tareas.
- Docencia y formación en robótica basada en aprendizaje: ejemplo didáctico de un experimento VLA con licencia permisiva (apache-2.0) y estructura de hojas bien documentada para cursos de posgrado o talleres técnicos.

## Benchmarks y rendimiento

Evaluación de política emparejada con semilla 7 (400 episodios, 4 suites × 10 tareas × 10 estados iniciales oficiales), 0 errores de rollout y limpieza de procesos verificada:

| Configuracion | Exito (sobre 400) | Tasa |
|---|---|---|
| view_large (este modelo, full-probe) | 117 | 29,25% |
| view_large v1 fixed | 104 | 26,00% |
| yaw30 full-probe | 201 | 50,25% |
| yaw30 v1 fixed | 215 | 53,75% |
| ur5e full-probe | 167 | 41,75% |
| ur5e v1 fixed | 164 | 41,00% |

Variacion full-probe frente a v1 fixed: view_large +3,25 puntos porcentuales; yaw30 -3,50 pp; ur5e +0,75 pp. El autor indica que estos cribados de 400 episodios no permiten concluir una mejora general, retención ni reemplazo del mejor baseline, y que no se incluye confirmación con políticas más grandes.

## Requisitos de hardware

- Entrenamiento: GPU B200 (indicada en el nombre del repositorio y en el contexto del experimento), con recetas numéricas sensibles al dispositivo.
- Inferencia: el despliegue restaura 74 hojas en BF16, por lo que se requiere un acelerador compatible con BF16.
- Tamano del repositorio: 13,1 GB, valor que debe considerarse al planificar almacenamiento y copia del checkpoint.
- Evaluación: se documentan 16 clientes por GPU y entorno MuJoCo 3.2.3, lo que permite dimensionar el servidor de políticas.
- Encaje en GPU de consumo: no disponible (no se especifican requisitos de VRAM ni GPUs objetivo para inferencia en la información proporcionada).
- Opciones de despliegue: openpi (librería declarada) con servidor de políticas; compatibilidad explícita con vLLM, llama.cpp, Ollama o TGI no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo / variante | Parametros | Contexto | Rendimiento (exito/400) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π₀.₅ view_large full-probe (este modelo) | no disponible | no disponible | 117 (29,25%) | apache-2.0 | HuggingFace |
| π₀.₅ view_large v1 fixed | no disponible | no disponible | 104 (26,00%) | no disponible | referencia interna del experimento |
| π₀.₅ yaw30 (full-probe / v1) | no disponible | no disponible | 201 / 215 | no disponible | referencia interna del experimento |
| π₀.₅ ur5e (full-probe / v1) | no disponible | no disponible | 167 / 164 | no disponible | referencia interna del experimento |

No se proporcionan modelos de terceros comparables en la información disponible.

## Limitaciones y advertencias

- Los resultados proceden de una única criba de 400 episodios; no establecen mejora general, retención ni sustitución del mejor baseline, según el propio autor.
- El efecto observado es desigual: mejora en view_large y ur5e, pero retroceso de 3,50 pp en yaw30, lo que indica sensibilidad a la configuración.
- Modelo de investigación con 0 descargas y 0 "me gusta" en el momento de la ficha; no hay validación externa ni adopción comunitaria.
- Las hojas de muñeca (23) se anexan solo para inferencia y no se entrenan, por lo que su comportamiento fuera del entorno de evaluación no está caracterizado.
- No hay holdout meta de sonda y las ventanas y linajes pueden solaparse entre optimizador y diagnóstico, lo que limita la interpretación estadística.
- Usa el conjunto libero-dense-contact-sweep-d2 y el benchmark LIBERO; su transferencia a tareas reales o a otras morfologías no está demostrada.
- Riesgo de alucinación: no aplicable en el sentido de lenguaje generativo; el riesgo relevante es la generación de acciones incorrectas en manipulación.
- Idiomas soportados no disponibles; el alcance lingüístico del bloque LLM no se documenta.
- Licencia apache-2.0 declarada, pero el hecho de derivar del stack openpi π₀.₅ puede implicar condiciones adicionales de la base; conviene verificar la licencia de la inicialización fuente antes de uso comercial.
- No se documentan sesgos específicos ni evaluación de equidad, algo poco habitual en modelos de robótica pero relevante para trazabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-b200-full-probe-fixed-view-large-1000-20261013
- Conjunto de datos objetivo: https://huggingface.co/datasets/Donghyun1228/libero-dense-contact-sweep-d2-20261002
- Librería openpi: https://github.com/Physical-Intelligence/openpi
- Benchmark LIBERO: https://libero-project.github.io/
