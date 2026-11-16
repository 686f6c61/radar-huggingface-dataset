# nirdesho6o/turndrift-d2-vectors

## Resumen

TurnDrift-Control D1/D2 Direction Vectors es un conjunto de vectores de dirección extraídos del modelo CohereLabs/tiny-aya-global (3.35B parámetros, FP16) por el usuario nirdesho6o. No se trata de un modelo generativo, sino de artefactos de interpretabilidad y control de activaciones: un vector de rechazo (D1) y un vector de contraste de inyección de prompts (D2). Se publican bajo licencia Apache 2.0 y la librería safetune, con pipeline declarado de feature-extraction.

El vector D2 es el componente con métricas publicadas: alcanza un AUROC de 0.946 en validación cruzada de 3 pliegues sobre un conjunto de calibración de 45 prompts de inyección y 45 limpios, con la mejor capa en la 16. El autor marca explícitamente el estado como "UNVALIDATED as steering vectors": los vectores clasifican bien, pero no se ha verificado que funcionen como mecanismos de steering en GPU.

Su relevancia es acotada pero concreta: sirve como punto de partida reproducible para experimentos de activation steering y para sondas lineales de detección de prompt injection, dentro del benchmark TurnDrift-Control presentado en el hackathon de seguridad y alineamiento de Lexsi Labs (Track 2a.3).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vectores de dirección (artefacto de interpretabilidad), no es un modelo; extraídos de CohereLabs/tiny-aya-global |
| Parámetros totales | No aplica al artefacto; modelo fuente: 3.35B |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el modelo fuente se procesó en FP16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (librería safetune; pesos publicados en el repositorio) |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo: extrae direcciones en el espacio de activaciones del residual stream de tiny-aya-global. D1 (dirección de rechazo) se calcula como la diferencia de medias entre activaciones de prompts dañinos y prompts inofensivos, mediante la función `extract_refusal_direction` de SafeTune. D2 (dirección de contraste de inyección) se obtiene por diferencia de medias en el último token, capa por capa, con validación cruzada de 3 pliegues; la mejor capa resulta ser la 16.

El conjunto de calibración consta de 45 ejemplos de inyección y 45 limpios, con hashes SHA-256 registrados en `results/auditkit/audit_record.json`. El autor documenta que la implementación de steering (ablación estilo `RefusalDirectionModel` y adición estilo CAA) no llegó a evaluarse: los coeficientes usados (α=1) eran demasiado pequeños frente a las normas del residual stream (del orden de centenares) y la rejilla de coeficientes relativos a la escala quedó diseñada pero sin ejecutar por agotamiento de cuota de GPU.

## Capacidades

- Clasificación lineal de entradas con inyección de prompts frente a conversaciones limpias, usando D2 como dirección de proyección (AUROC 0.946 en validación cruzada).
- Extracción de características (feature-extraction) sobre activaciones de tiny-aya-global.
- Punto de partida para experimentos de activation steering con escalado relativo a la norma.
- Reproducción del resultado de AUROC de D2 documentado por el autor.
- No incluye generación de texto, razonamiento, código ni capacidades multimodales propias.
- No soporta tool calling, agentes ni multi-step reasoning por sí mismo.
- Capacidades multilingües: no disponibles (heredadas, en su caso, del modelo fuente, no documentadas).

## Casos de uso

- Detección de prompt injection en pipelines de entrada: proyectar las activaciones del último token sobre D2 y usar el valor como señal de clasificación antes de enviar el prompt a un LLM, aprovechando el AUROC de 0.946 medido sobre el conjunto de calibración.
- Sonda lineal de investigación en seguridad: usar D2 como baseline reproducible para comparar con clasificadores entrenados y estudiar qué capas concentran la señal de inyección (capa 16 como referencia).
- Experimentos de activation steering: emplear D1 y D2 con coeficientes escalados respecto a la norma del residual stream para estudiar si la ablación o adición de direcciones modifica el comportamiento del modelo fuente.
- Auditoría de robustez de tiny-aya-global: medir cómo varía la separabilidad de la señal de inyección ante distintos formatos de ataque y longitudes de conversación.
- Docencia y reproducción de resultados: el repositorio incluye hashes de calibración y registro de auditoría, lo que permite replicar el experimento de forma verificable.
- Base para extender el método a otros modelos: la metodología de diferencia de medias por capa con validación cruzada es reutilizable para extraer direcciones análogas en modelos de mayor tamaño.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Mejor capa (D2) | 16 |
| AUROC D2 (validación cruzada 3 pliegues) | 0.946 |
| Conjunto de calibración | 45 inyección + 45 limpios |
| Método | Diferencia de medias en último token, por capa |
| Evaluación de steering | No ejecutada |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El artefacto en sí (vectores de dirección) es de tamaño reducido y no requiere GPU para almacenarse o inspeccionarse.
- Para usarlo sobre activaciones es necesario ejecutar el modelo fuente, CohereLabs/tiny-aya-global (3.35B) en FP16, lo que implica aproximadamente 6.7 GB solo en pesos, más overhead de activaciones y caché KV.
- GPU recomendadas para el modelo fuente: una RTX 4090 (24 GB) o superior es suficiente en FP16; A100 o H100 para lotes grandes o mayor throughput.
- Cabe en GPU de consumo con cuantización del modelo fuente (por ejemplo, 8 bits o 4 bits), aunque la información disponible no documenta cuantizaciones probadas para este artefacto.
- Opciones de despliegue: la extracción usa la librería safetune; para servir el modelo fuente se puede recurrir a vLLM, TGI o llama.cpp, si bien no se documentan configuraciones validadas en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye artefactos comparables de vectores de dirección ni resultados frente a otras sondas de detección de prompt injection.

## Limitaciones y advertencias

- Estado explícitamente no validado como vectores de steering: no se ha comprobado en GPU que modifiquen el comportamiento del modelo.
- Los coeficientes de steering empleados (α=1) resultaron demasiado pequeños frente a las normas del residual stream (del orden de centenares); falta la rejilla de coeficientes relativos a la escala.
- El conjunto de calibración es pequeño (45 + 45 ejemplos), lo que limita la generalización del AUROC reportado.
- El AUROC de 0.946 corresponde a validación cruzada de 3 pliegues sobre ese conjunto concreto, no a una evaluación en producción.
- Uso previsto exclusivamente de investigación; no se documentan garantías para despliegue comercial en sistemas de seguridad.
- No se documentan sesgos, cobertura idiomática ni tasas de falsos positivos/negativos en escenarios reales.
- Depende del modelo fuente tiny-aya-global: los vectores no son transferibles sin verificación a otras arquitecturas o tamaños.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero el modelo fuente puede tener condiciones propias que deben revisarse por separado.

## Enlaces

- Hugging Face: https://huggingface.co/nirdesho6o/turndrift-d2-vectors
- Repositorio TurnDrift-Control: https://github.com/nirdesho6o/turndrift
- Modelo fuente: https://huggingface.co/CohereLabs/tiny-aya-global
