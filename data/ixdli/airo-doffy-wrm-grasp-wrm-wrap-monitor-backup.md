# IXDLI/AIRO-Doffy-WRM-Grasp-WRM-wrap-monitor-backup

## Resumen

El modelo `IXDLI/AIRO-Doffy-WRM-Grasp-WRM-wrap-monitor-backup` es un componente de supervisión para un sistema robótico de manipulación basado en *diffusion policy*. Desarrollado por el usuario IXDLI, se presenta como una copia de seguridad estricta del monitor "Beaver" para el policy congelado `WRM_wrap` entrenado con 50k pasos. Se trata de un pequeño MLP (perceptrón multicapa) que procesa exclusivamente las señales de cuatro sensores táctiles (denominados Key4: `01, 02, 10, 11`) y produce dos estados binarios: estado de elevación (`lift_state`) y estado de contacto (`contact_state`).

El modelo está diseñado para verificar de forma exhaustiva el comportamiento del policy de agarre, comprobando los 512 patrones binarios posibles de los nueve sensores, aunque solo cuatro entran en la red. Su relevancia radica en que proporciona una capa de seguridad y monitorización en tiempo real para sistemas de manipulación robótica, permitiendo detectar condiciones de contacto y elevación con umbrales fijos. El repositorio incluye tanto el monitor aislado (`monitor.pt`) como un checkpoint combinado (`checkpoints/last.pt`) que integra los pesos congelados del policy EMA de WRM_wrap junto con el monitor, listo para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) pequeño |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El modelo es un MLP de tamaño reducido que actúa como monitor de un policy de difusión congelado. La entrada se limita a cuatro sensores táctiles (Key4: `01, 02, 10, 11`); los otros cinco sensores se enmascaran antes de la red, de modo que estructuralmente no pueden influir en la salida. El entrenamiento se realiza para destilar exactamente las siguientes condiciones:

- `near`: 0 mm
- `closing scale`: 50 mm
- `lift minimum wrap`: 0.25 (al menos un contacto exacto a cero en Key4)
- `stop-close wrap`: 0.5 (al menos dos contactos exactos a cero en Key4)
- `contact stop`: 0 mm

La salida es un vector `[lift_state, contact_state]` con un umbral de decisión fijo `logit >= 0`. El monitor se valida de forma exhaustiva sobre los 512 patrones binarios de los nueve sensores, y los resultados se registran en `metrics.json` (no incluido en la información proporcionada). El checkpoint `checkpoints/last.pt` contiene el policy combinado desplegable, con los pesos EMA congelados de WRM_wrap más el monitor entrenado.

## Capacidades

- Monitorización de estados de contacto y elevación en tareas de agarre robótico.
- Verificación exhaustiva de todos los patrones binarios posibles de los sensores (512 combinaciones).
- Enmascaramiento estructural de sensores no relevantes, garantizando que solo los sensores Key4 afectan a la salida.
- Salida binaria con umbral fijo (`logit >= 0`), adecuada para decisiones de control en tiempo real.
- Integración con un policy de difusión congelado (WRM_wrap) para despliegue combinado.
- Compatible con el ecosistema PyTorch y el pipeline de robótica de Hugging Face.

## Casos de uso

- **Control de agarre en robots manipuladores**: el monitor puede utilizarse para verificar en tiempo real si el robot ha establecido contacto suficiente (según los umbrales de wrap) antes de proceder con la elevación, evitando fallos de agarre.
- **Sistema de seguridad en teleoperación VR**: dado que existe un repositorio asociado de teleoperación VR (AIRO-Doffy), el monitor puede integrarse como capa de validación para garantizar que los comandos del operador no provoquen estados inseguros.
- **Validación de policies de difusión**: al ser un monitor exhaustivo, puede emplearse para comprobar que un policy de difusión entrenado (WRM_wrap) se comporta dentro de los límites esperados en cuanto a contacto y elevación, antes de su despliegue en producción.
- **Depuración de sistemas de percepción táctil**: el enmascaramiento de sensores permite aislar el efecto de los sensores Key4, facilitando la identificación de fallos en otros sensores sin afectar al monitor.
- **Investigación en robótica táctil**: el modelo sirve como referencia para estudiar la destilación de políticas de control en tareas de manipulación con realimentación táctil.
- **Backup y redundancia**: al ser una copia de seguridad estricta del monitor Beaver, puede utilizarse como respaldo en sistemas críticos donde se requiera alta disponibilidad y consistencia en la monitorización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un `metrics.json` con la tabla de verdad exhaustiva y el margen mínimo de logit, pero no se incluye en los datos proporcionados.

## Requisitos de hardware

- Al ser un MLP pequeño (tamaño de repo 0.3 GB), la inferencia es extremadamente ligera y puede ejecutarse en CPU sin problemas.
- No se requiere GPU para la inferencia del monitor aislado; el checkpoint combinado (`checkpoints/last.pt`) incluye el policy de difusión, que sí puede requerir más recursos, pero no se especifican.
- Para el despliegue en robótica, se recomienda un sistema embebido con soporte PyTorch (por ejemplo, Jetson o similar), aunque no hay datos concretos de VRAM.
- Opciones de despliegue: PyTorch nativo, posiblemente con TorchScript para optimización en producción.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, dado que se trata de un componente específico de monitorización para un policy de difusión concreto, no de un modelo generalista.

## Limitaciones y advertencias

- El modelo es un monitor específico para el policy `WRM_wrap`; no es un modelo de propósito general y no puede utilizarse fuera de ese contexto sin reentrenamiento.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial o modificación.
- No se proporcionan datos sobre el rendimiento en condiciones reales (ruido de sensores, variaciones de fabricación, etc.).
- El enmascaramiento de cinco sensores implica que cualquier fallo en los sensores Key4 no será detectado por el monitor, ya que son la única entrada.
- El umbral de decisión fijo (`logit >= 0`) puede no ser óptimo en entornos con calibración diferente de los sensores.
- No hay información sobre la robustez del modelo ante distribuciones de datos distintas a las del entrenamiento.

## Enlaces

- [Hugging Face - IXDLI/AIRO-Doffy-WRM-Grasp-WRM-wrap-monitor-backup](https://huggingface.co/IXDLI/AIRO-Doffy-WRM-Grasp-WRM-wrap-monitor-backup)
- [GitHub - XDL0-0/AIRO-Doffy (código de teleoperación VR)](https://github.com/XDL0-0/airo-doffy)
- [Dataset asociado - IXDLI/WRM_grasp_cylinder_lero](https://huggingface.co/datasets/IXDLI/WRM_grasp_cylinder_lero)
