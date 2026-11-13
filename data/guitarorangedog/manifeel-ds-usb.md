# guitarorangedog/manifeel-ds-usb

## Resumen

`manifeel-ds-usb` es un checkpoint de política de difusión (diffusion policy) para robótica entrenado con el framework robo-synapse sobre LeRobot 0.6.1. Lo publica el usuario `guitarorangedog` como baseline del dataset táctil `RoboSynapse/manifeel-tacr_franka-panda_usb`, orientado a manipulación con un robot Franka Panda equipado con sensor USB. No es un modelo de lenguaje: es un modelo de control que mapea observaciones visuales (cámara de muñeca e imagen táctil derecha) a acciones motrices.

El modelo forma parte de la familia ManiFeel y se presenta como "DemoSpeedup (DP backbone)", es decir, una variante de diffusion policy pensada para acelerar la ejecución de la política manteniendo una tasa de éxito razonable. Según la model card, alcanza un 61,5 % de éxito en 200 episodios de evaluación (4 semillas × 50 episodios, máximo 500 pasos) y es 1,38× más rápido que la diffusion policy de referencia en pasos hasta el primer éxito.

Su relevancia es acotada pero concreta: sirve como punto de partida reproducible para quien quiera experimentar con políticas viso-táctiles en Franka Panda, y como base de comparación para variantes de aceleración de diffusion policy. El repositorio ocupa 1,3 GB y contiene 329.216.262 parámetros en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (backbone DP), política viso-táctil para robótica |
| Parametros totales | 329.216.262 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo de control, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

La arquitectura es una diffusion policy, un enfoque de imitación que genera trayectorias de acción mediante un proceso de difusión condicionado por observaciones. El checkpoint se entrena con robo-synapse sobre LeRobot 0.6.1 y usa como entradas la cámara de muñeca y la imagen táctil derecha (`tacimg`), con semilla 1000, precisión mixta (AMP) y aumentación de datos desactivada. El dataset de entrenamiento es `RoboSynapse/manifeel-tacr_franka-panda_usb`, específico de un Franka Panda con sensor táctil USB.

La innovación declarada es la aceleración de la política ("DemoSpeedup"): el autor reporta 1,38× de mejora en el paso medio hasta el primer éxito frente a la DP de referencia, manteniendo un 61,5 % de éxito. No se detallan en la información disponible el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en este dominio). La receta y el código están enlazados a un pull request del repositorio robo-synapse.

## Capacidades

- Control robótico de manipulación: genera acciones motrices para un Franka Panda a partir de observaciones visuales y táctiles.
- Fusión viso-táctil: combina cámara de muñeca e imagen táctil derecha (`tacimg`) como entradas.
- Ejecución de políticas de imitación entrenadas por difusión.
- Aceleración de la ejecución respecto a la DP de referencia (1,38× en pasos hasta el primer éxito).
- Integración con el ecosistema LeRobot (carga y evaluación mediante la librería lerobot).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Baseline reproducible para investigación en políticas viso-táctiles: sirve como referencia contra la que comparar variantes de diffusion policy en tareas de manipulación con Franka Panda.
- Evaluación de aceleración de políticas: permite medir el compromiso entre velocidad de ejecución (1,38×) y tasa de éxito (61,5 %) en entornos controlados.
- Desarrollo de manipulación con feedback táctil: útil para estudiar cómo la imagen táctil mejora el control en tareas que requieren contacto, como agarre o inserción.
- Punto de partida para fine-tuning: al estar entrenado con robo-synapse y LeRobot 0.6.1, se puede reentrenar o adaptar a datasets propios del mismo robot y sensor.
- Reproducción de experimentos: la receta enlazada en el PR permite replicar el entrenamiento con semilla 1000, AMP y aumentación desactivada.
- Docencia y prototipado en robótica: ejemplo concreto de pipeline completo (dataset, entrenamiento, checkpoint y métricas) para cursos o pruebas internas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tasa de éxito | 61,5 % (4 semillas × 50 episodios, máximo 500 pasos) |
| Aceleración vs DP | 1,38× (paso medio hasta el primer éxito, episodios exitosos) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 329 M de parámetros, una estimación razonable en fp32 ronda los 1,3 GB de pesos, más memoria para activaciones y buffers de difusión, pero el dato exacto no está publicado.
- GPU recomendadas: no disponibles; al tratarse de un modelo de robótica de 329 M de parámetros, es plausible que quepa en GPUs de consumo, pero no se confirma en la información.
- ¿Cabe en GPU de consumo? No confirmado.
- Opciones de despliegue: librería lerobot (formato nativo del checkpoint); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles; solo se reporta la métrica relativa de 1,38× frente a DP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| manifeel-ds-usb | 329.216.262 | no aplica | 61,5 % éxito; 1,38× vs DP | no disponible | Hugging Face |
| Diffusion Policy de referencia (DP backbone) | no disponible | no aplica | baseline del que parte la comparación | no disponible | no disponible |
| Otras variantes ManiFeel | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas concretas de la misma categoría (políticas viso-táctiles para Franka Panda); la única referencia es la DP de la que deriva el propio checkpoint.

## Limitaciones y advertencias

- Específico de hardware y sensor: entrenado para un Franka Panda con sensor táctil USB concreto; no es portable directamente a otros robots o sensores.
- Tasa de éxito moderada: 61,5 % implica que aproximadamente 4 de cada 10 episodios fallan dentro del límite de 500 pasos.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de usarlo en producción.
- Sin datos de sesgos, alucinación o idioma: no aplican en el sentido habitual, pero tampoco se documentan riesgos de generalización fuera de la distribución del dataset.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso independiente.
- Aumentación desactivada y una sola semilla de entrenamiento (1000): la robustez frente a variaciones de entorno no está documentada.
- No hay información sobre cuantización ni formatos alternativos de despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/guitarorangedog/manifeel-ds-usb
- Dataset: https://huggingface.co/datasets/RoboSynapse/manifeel-tacr_franka-panda_usb
- Código y receta (PR): https://github.com/kwk2696/robo-synapse/pull/3
