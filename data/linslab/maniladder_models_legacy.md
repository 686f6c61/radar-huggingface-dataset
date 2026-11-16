# Linslab/ManiLadder_Models_legacy

## Resumen

ManiLadder_Models_legacy es un repositorio de pesos de Hugging Face publicado por Linslab que contiene checkpoints de políticas de flow matching de pequeño tamaño, asociados a tareas de manipulación robótica dentro del proyecto ManiLadder. El repositorio se conserva como copia previa a una fusión (pre-merge) y mantiene el historial de commits de la versión original `Linslab/ManiLadder_Models`. Según la model card, la copia mantenida y recomendada para trabajo nuevo es `Linslab/ManiLadder_Models`, donde los mismos ficheros residen bajo la ruta `small_flow_matching_policy/<task>/`.

El contenido no es un modelo de lenguaje, sino un conjunto de checkpoints de políticas de control entrenadas mediante flow matching y, según la documentación, con representaciones RADIO. La release documentada más reciente es BagDropIn-v1 (9 de noviembre de 2026), que incluye un checkpoint de escena de pared seleccionado en el paso 30k, con una tasa de éxito reportada de 4 sobre 50 intentos (8 %). El fichero de compatibilidad `ckpt_final.pt` contiene el paso 30000, no el 40000.

El repositorio tiene un tamaño de 242,1 GB, lo que refleja la acumulación de múltiples checkpoints y artefactos auxiliares, no un único modelo. La licencia es MIT. No se dispone de información sobre arquitectura detallada, parámetros, contexto ni idiomas, por lo que la ficha se limita a los datos verificables en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de flow matching con representaciones RADIO (detalle no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.pt`) |
| Tamano del repositorio | 242,1 GB |
| Tareas incluidas | `small_flow_matching_policy/<task>/`, BagDropIn-v1 |
| Paso del checkpoint destacado | 30000 (`ckpt_final.pt` en BagDropIn-v1) |

## Arquitectura y entrenamiento

La información disponible indica que se trata de políticas de flow matching de pequeño tamaño, acompañadas de representaciones RADIO, orientadas a tareas de manipulación robótica. El repositorio se describe como la copia pre-merge de los checkpoints originales y conserva el historial de commits. No se detalla el número de parámetros, la composición del dataset de entrenamiento, el número de tokens o episodios, ni si se emplearon técnicas de RLHF, DPO u otras etapas de ajuste.

El único dato concreto de entrenamiento es el checkpoint seleccionado para BagDropIn-v1 en la escena de pared: paso 30000, con una tasa de éxito de 4/50 (8 %). La model card advierte que el fichero `ckpt_final.pt` contiene el paso 30000 y no el 40000, y que debe usarse junto con sus estadísticas de normalización emparejadas y la revisión del entorno VR enlazada. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control de políticas de manipulación robótica mediante flow matching en tareas específicas incluidas en el repositorio.
- Ejecución de tareas de escena de pared (wall-scene) en el caso BagDropIn-v1.
- Integración con representaciones RADIO para el procesamiento de observaciones.
- Uso previsto con estadísticas de normalización emparejadas y una revisión concreta del entorno VR.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Reproducción de experimentos de manipulación robótica: el repositorio conserva el historial de commits y los checkpoints originales, lo que permite reproducir resultados previos a la fusión con el repositorio mantenido.
- Evaluación de la tarea BagDropIn-v1: el checkpoint del paso 30000 permite medir la tasa de éxito reportada (8 %) en la escena de pared y comparar con variantes posteriores.
- Investigación en flow matching aplicado a control: los checkpoints de pequeño tamaño sirven como base para estudiar políticas de flow matching en entornos de manipulación.
- Integración en entornos de simulación VR: la model card referencia una revisión concreta del entorno VR, lo que facilita desplegar la política en el simulador correspondiente.
- Auditoría de artefactos de entrenamiento: el tamaño del repositorio y la estructura por tareas permiten inspeccionar los checkpoints intermedios y las estadísticas de normalización asociadas.
- Migración a la versión mantenida: sirve como referencia para verificar que los ficheros de `Linslab/ManiLadder_Models` son idénticos antes de adoptar el repositorio activo.

## Benchmarks y rendimiento

| Tarea | Checkpoint | Metrica | Resultado |
|---|---|---|---|
| BagDropIn-v1 (wall-scene) | paso 30000 | Tasa de exito | 4/50 (8 %) |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; los pesos se distribuyen como checkpoints PyTorch (`.pt`) y requieren el entorno VR referenciado en la model card.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 242,1 GB, por lo que conviene descargar solo la carpeta de la tarea concreta.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas de flow matching para manipulación robótica) con parámetros, contexto o rendimiento verificables.

## Limitaciones y advertencias

- Repositorio legacy: la model card indica explícitamente que el trabajo nuevo debe usar `Linslab/ManiLadder_Models`, no esta copia.
- Tasa de éxito baja en BagDropIn-v1: 4/50 (8 %) en el checkpoint del paso 30000, insuficiente para uso en producción sin mejoras.
- Advertencia sobre el nombre del fichero: `ckpt_final.pt` contiene el paso 30000, no el 40000, lo que puede inducir a error si se asume lo contrario.
- Dependencia de estadísticas de normalización emparejadas y de una revisión concreta del entorno VR; usar otras versiones puede invalidar los resultados.
- No hay información sobre sesgos, alucinación o cobertura idiomática porque no es un modelo de lenguaje.
- Licencia MIT: permite uso comercial, pero no se documentan garantías ni condiciones adicionales del autor.
- No se dispone de datos de parámetros, arquitectura detallada ni requisitos de hardware, lo que dificulta planificar el despliegue.

## Enlaces

- Repositorio legacy: https://huggingface.co/Linslab/ManiLadder_Models_legacy
- Repositorio mantenido: https://huggingface.co/Linslab/ManiLadder_Models
- README de BagDropIn-v1: https://huggingface.co/Linslab/ManiLadder_Models_legacy/blob/main/BagDropIn-v1/README.md
