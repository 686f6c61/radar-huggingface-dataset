# BenoitJT-GIRARD/qwen3-1.7b-chsa-triage-dpo

## Resumen

qwen3-1.7b-chsa-triage-dpo es un adaptador LoRA (biblioteca PEFT) que resulta de la alineación por preferencias (DPO) de un modelo de asistencia al triaje de urgencias del CHSA. Lo publica el usuario BenoitJT-GIRARD y se aplica sobre el modelo supervisado fusionado BenoitJT-GIRARD/qwen3-1.7b-chsa-triage-sft-merged, a su vez derivado de Qwen3-1.7B-Base. El repositorio ocupa 0,1 GB porque contiene únicamente los pesos del adaptador, no el modelo completo.

El modelo aborda una tarea muy concreta: a partir de un caso clínico, sugerir un nivel de urgencia y una conducta inicial sin emitir diagnósticos y respetando el idioma impuesto por la consigna de sistema. La etapa DPO se emplea para penalizar respuestas que subestiman la gravedad, proponen una actuación que retrasa la asistencia, afirman un diagnóstico o incumplen la lengua solicitada. El autor publica además un modelo final fusionado que integra las dos etapas y que es la referencia recomendada para servir el sistema.

Se trata de un prototipo pedagógico: el catálogo clínico usado para construir los datos no fue validado por un médico urgentista y el propio autor advierte de que no debe usarse en situaciones reales. La evaluación sobre 60 casos manuscritos arroja una exactitud de triaje de 0,700 y, de forma crítica, un 27,5 % de subtriaje en casos urgentes, lo que refuerza la necesidad de supervisión humana.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3-1.7B) con adaptador LoRA/PEFT añadido |
| Parametros totales | Aproximadamente 1.700 millones (modelo base Qwen3-1.7B); adaptador de 0,1 GB |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors sin cuantización declarada) |
| Idiomas soportados | Frances (fr) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

La pieza publicada es exclusivamente un adaptador LoRA, no un modelo completo. Se entrena sobre BenoitJT-GIRARD/qwen3-1.7b-chsa-triage-sft-merged y no sobre Qwen3-1.7B-Base: el autor advierte explícitamente de que aplicar el adaptador sobre el modelo de base produciría una composición de pesos incoherente. La etapa previa de ajuste supervisado (SFT) no está documentada en la información disponible en cuanto a número de tokens, composición del dataset o método de anotación.

La innovación técnica de esta etapa es el uso de DPO sobre pares de preferencia construidos con criterios clínicos explícitos: se prefiere la respuesta que no subestima el nivel de urgencia, que no propone una conducta que retrase la atención, que no afirma un diagnóstico (la consigna de sistema lo prohíbe) y que respeta el idioma impuesto. Los pares comparten formato y longitud comparable; el autor señala que, sin esa precaución, el alineamiento aprende la longitud en lugar del contenido y el modelo deja de emitir el token de fin. No se dispone de más detalles sobre hiperparámetros, número de pares o configuración del LoRA.

## Capacidades

- Generación de una propuesta de nivel de urgencia y conducta inicial a partir de un caso clínico descrito en texto.
- Salida estructurada consumible por un sistema de información: el 100 % de las respuestas resultó explotable en la evaluación del autor.
- Supresión explícita de diagnósticos, por restricción de la consigna de sistema.
- Detección de casos urgentes, con un 27,5 % de subtriaje medido, lo que limita esta capacidad.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües limitadas a frances e ingles.
- Capacidad especial: ninguna adicional documentada (sin visión, audio ni modo de razonamiento extendido declarado).

## Casos de uso

- Investigación sobre alineación por preferencias en dominio médico: permite estudiar cómo DPO modifica la calibración de riesgo de subtriaje frente a la etapa SFT, comparando ambas sobre el mismo conjunto de casos.
- Docencia y simulación formativa: sirve para ilustrar a personal en formación cómo un asistente propone niveles de urgencia, siempre con revisión por un tutor y nunca como decisión clínica.
- Generación de datos sintéticos de pre-triaje para ampliar conjuntos de evaluación, bajo revisión humana posterior y sin uso asistencial.
- Prototipado de asistentes de triaje en laboratorio: al integrarse con transformers y PEFT sobre el modelo fusionado, permite montar demos controladas con supervisión humana obligatoria.
- Extracción y estructuración del nivel de urgencia en un formato consumible por un sistema de información, gracias al 100 % de respuestas explotables reportado.
- Evaluación comparativa de técnicas de alineación (SFT frente a SFT+DPO) sobre una tarea de clasificación clínica multilingüe en frances e ingles.
- Análisis de errores y calibración de riesgo: el 27,5 % de subtriaje lo convierte en un caso de estudio útil para investigar métricas de seguridad en modelos clínicos.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos sobre 60 casos manuscritos nunca vistos en entrenamiento, de los cuales cerca de la mitad son presentaciones atípicas.

| Métrica | Valor sobre 60 casos |
|---|---|
| Exactitud del nivel de triaje | 0,700 [0,57 – 0,80] |
| Subtriaje de casos urgentes | 27,5 % |
| Supratriaje, todos los casos | 11,7 % |
| Respuestas explotables por el sistema de información | 100 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, partiendo de 1.700 millones de parámetros más el adaptador (cálculos estimados, no publicados por el autor): en FP16/BF16 en torno a 4-5 GB contando pesos y caché KV; en INT8 alrededor de 2-3 GB; en INT4 alrededor de 1,5-2 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM es suficiente; A100, H100 o L40S quedan sobredimensionadas para este tamaño y solo se justifican por agregación de peticiones.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070 o superiores, e incluso en CPU mediante llama.cpp tras fusionar y convertir a GGUF.
- Opciones de despliegue: transformers con PEFT (para el adaptador), vLLM y TGI (requieren fusionar previamente), llama.cpp y Ollama (requieren el modelo fusionado convertido a GGUF).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han identificado en la búsqueda modelos públicos comparables de triaje médico del mismo tamaño. La comparación más informativa es con las distintas etapas del propio proyecto.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| qwen3-1.7b-chsa-triage-dpo (este) | ~1.700 M + LoRA | no disponible | MIT | safetensors (LoRA) | 0,700 de exactitud de triaje; 27,5 % de subtriaje | Publico en HuggingFace |
| qwen3-1.7b-chsa-triage-sft-merged | ~1.700 M | no disponible | MIT | safetensors (fusionado) | no disponible | Publico en HuggingFace |
| qwen3-1.7b-chsa-triage (final fusionado) | ~1.700 M | no disponible | MIT | safetensors (fusionado) | no disponible | Publico en HuggingFace |
| Qwen3-1.7B-Base | ~1.700 M | no disponible | no disponible | safetensors | no disponible | Publico en HuggingFace |

## Limitaciones y advertencias

- Prototipo pedagógico: el catálogo clínico que sustenta los datos no fue validado por un médico urgentista y el autor prohíbe explícitamente el uso en situaciones reales.
- El 27,5 % de subtriaje en casos urgentes es un riesgo de seguridad grave: un sistema que infravalora la gravedad puede retrasar la atención de pacientes críticos.
- Exactitud de triaje de 0,700 con intervalo de confianza [0,57 – 0,80] sobre solo 60 casos, muestra pequeña para extraer conclusiones robustas.
- Supratriaje del 11,7 % en el conjunto global, con el coste de recursos que implica.
- Riesgo de alucinación inherente a un modelo de 1.700 millones en dominio médico; la consigna de sistema prohíbe afirmar diagnósticos, pero no elimina el riesgo de contenido erróneo.
- Cobertura lingüística limitada a frances e ingles; no hay soporte declarado de castellano.
- Restricción de composición: el adaptador debe aplicarse sobre el modelo SFT fusionado, nunca sobre Qwen3-1.7B-Base, so pena de obtener pesos incoherentes.
- Para servir el sistema, el autor recomienda el modelo final fusionado, ya que el adaptador obliga a hospedar también el modelo SFT y a emparejarlos.
- Licencia MIT, que permite uso comercial, pero el propio autor desaconseja cualquier uso clínico real.
- Ante cualquier signo vital comprometido, la indicación del autor es llamar al 15 (SAMU).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BenoitJT-GIRARD/qwen3-1.7b-chsa-triage-dpo
- Modelo base supervisado fusionado: https://huggingface.co/BenoitJT-GIRARD/qwen3-1.7b-chsa-triage-sft-merged
- Modelo final fusionado recomendado: https://huggingface.co/BenoitJT-GIRARD/qwen3-1.7b-chsa-triage
- Repositorio del proyecto: https://github.com/BenoitJT-GIRARD/chsa-triage
