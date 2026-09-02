# IXDLI/AIRO-Doffy-WRM-Grasp-WRM-wrap-monitor

## Resumen

El modelo `IXDLI/AIRO-Doffy-WRM-Grasp-WRM-wrap-monitor` es un monitor temporal de ejecución diseñado específicamente para supervisar una política de difusión (Diffusion Policy) congelada denominada WRM_wrap, orientada a tareas de agarre robótico con sensores táctiles. Desarrollado por el usuario IXDLI, este componente se integra en un sistema de teleoperación robótica (proyecto AIRO-Doffy) y actúa como un pequeño perceptrón multicapa (MLP) que procesa características limitadas de nueve sensores táctiles Beaver de 4x4, con retardos temporales específicos, para determinar dos estados críticos: el estado de contacto y el estado de elevación (lift).

El modelo resuelve el problema de monitorizar en tiempo real si un agarre se ha completado correctamente y si la elevación del objeto puede iniciarse, liberando o congelando articulaciones del robot según las señales táctiles. Su relevancia radica en que permite un control de ejecución más robusto en tareas de manipulación con sensores táctiles, sin necesidad de umbrales de despliegue manuales. El repositorio contiene el monitor entrenado (`monitor.pt`) y una versión combinada desplegable (`checkpoints/last.pt`) que incluye los pesos congelados de la política WRM_wrap junto con el monitor. El tamaño total del repositorio es de 0,3 GB, lo que sugiere un modelo ligero, aunque no se especifican los parámetros exactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) sobre características de sensores táctiles Beaver 4x4 con lags [0, 1, 3, 6, 11] |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa ventanas temporales fijas de 5 lags) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

Según la model card, el monitor es un MLP pequeño que opera sobre características acotadas provenientes de nueve sensores táctiles Beaver de 4x4, considerando retardos temporales en los índices `[0, 1, 3, 6, 11]`. La salida se organiza como un vector `[lift_state, contact_state]`, donde `lift_state` indica si se debe iniciar la elevación y `contact_state` refleja la tensión del agarre. Un límite de logit fijo en cero se utiliza para liberar la articulación J1 (para el lift) y congelar las articulaciones J3, J4 y J5 después de que se detecta el agarre. No se emplean umbrales de puerta de despliegue adicionales.

El entrenamiento se realizó sobre un dataset original de 125 episodios, con etiquetas derivadas de la tensión de contacto (`contact_state=tightness`) y del inicio del lift, definido como la primera secuencia de seis frames donde J1 supera en al menos 0,02 radianes su línea base inicial en la dirección de elevación demostrada. La división de datos se hizo estratificada por episodio completo: 75 episodios para entrenamiento, 25 para validación y 25 para prueba. No se proporcionan detalles sobre el número de tokens, el proceso de optimización o si se utilizaron técnicas como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Monitorización temporal de ejecución en tareas de agarre robótico con sensores táctiles.
- Detección de estado de contacto (tensión del agarre) y estado de elevación (lift) a partir de señales táctiles.
- Control de articulaciones: libera J1 para el lift y congela J3/J4/J5 tras el agarre, basado en un límite de logit fijo.
- Integración con una política de difusión congelada (WRM_wrap) para supervisar su ejecución en tiempo real.
- No es un modelo generativo de texto, código ni imágenes; su ámbito es exclusivamente robótico.
- No se reportan capacidades de tool calling, agentes o razonamiento multi-paso fuera de su dominio específico.

## Casos de uso

- Control de agarre en manipulación robótica: el monitor puede utilizarse para verificar que un objeto ha sido correctamente agarrado antes de proceder a la elevación, evitando fallos por deslizamiento o agarre incompleto.
- Teleoperación con realidad virtual: integrado en el sistema AIRO-Doffy, permite que un operador humano reciba retroalimentación táctil y de estado durante la manipulación remota, mejorando la precisión en tareas delicadas.
- Automatización de ensamblaje: en líneas de producción donde se requiere un agarre consistente de piezas de diferentes tamaños, el monitor puede activar o desactivar fases del proceso según el estado de contacto detectado.
- Robótica asistencial: en tareas de ayuda a personas con movilidad reducida, el modelo puede supervisar la manipulación de objetos cotidianos, garantizando que el agarre sea seguro antes de levantar.
- Investigación en aprendizaje por demostración: el monitor sirve como componente de supervisión en experimentos de políticas de difusión, permitiendo analizar la calidad de la ejecución en tiempo real.
- Desarrollo de sistemas de control basados en sensores táctiles: sirve como referencia para implementar monitores de ejecución en otros robots con sensores similares, gracias a su diseño ligero y su enfoque en características acotadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de `metrics.json` y `dataset_manifest.json` con resultados y definiciones de eventos, pero no se incluyen valores numéricos en la documentación pública.

## Requisitos de hardware

- El tamaño del repositorio es de 0,3 GB, lo que sugiere un modelo ligero, probablemente ejecutable en CPU o en GPUs de gama baja.
- No se especifican requisitos de VRAM ni GPUs recomendadas. Dado que es un MLP pequeño, es plausible que quepa en cualquier GPU comercial (por ejemplo, RTX 3060 o superior), pero este dato no está confirmado.
- Opciones de despliegue: al ser un modelo PyTorch, puede integrarse en frameworks de robótica como ROS, o ejecutarse directamente con PyTorch. No se mencionan compatibilidades con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Al ser un MLP con pocas capas, se espera una latencia muy baja, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (monitores temporales para políticas de difusión con sensores táctiles). El campo es muy específico y no se han encontrado alternativas públicas similares en la búsqueda web. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para el entorno robótico específico descrito (sensores Beaver 4x4, articulaciones J1, J3, J4, J5). No es transferible a otros robots sin reentrenamiento.
- No se proporciona información sobre sesgos, riesgos de alucinación o limitaciones de contexto, ya que no es un modelo de lenguaje.
- La licencia no está especificada, por lo que el uso comercial y la redistribución son inciertos. Se recomienda contactar al autor antes de utilizarlo en producción.
- El monitor depende de la política congelada WRM_wrap; cualquier cambio en la política subyacente podría invalidar su funcionamiento.
- Los datos de entrenamiento provienen de un dataset de 125 episodios, lo que puede limitar la generalización a escenarios no vistos, como objetos con propiedades táctiles muy diferentes.
- No se han publicado métricas de rendimiento detalladas, lo que dificulta evaluar su fiabilidad en condiciones reales.

## Enlaces

- [HuggingFace - IXDLI/AIRO-Doffy-WRM-Grasp-WRM-wrap-monitor](https://huggingface.co/IXDLI/AIRO-Doffy-WRM-Grasp-WRM-wrap-monitor)
- [GitHub - XDL0-0/AIRO-Doffy (VR teleoperation code and app)](https://github.com/XDL0-0/airo-doffy)
- [GitHub - XDL0-0/AIRO-DOFFY-APP (Docs)](https://github.com/XDL0-0/AIRO-DOFFY-APP/tree/main/Docs)
- [Dataset - IXDLI/WRM_grasp_cylinder_different_sizes_lero](https://huggingface.co/datasets/IXDLI/WRM_grasp_cylinder_different_sizes_lero)
- [Dataset - IXDLI/WRM_grasp_cylinder_lero](https://huggingface.co/datasets/IXDLI/WRM_grasp_cylinder_lero)
