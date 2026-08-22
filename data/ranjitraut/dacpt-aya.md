# ranjitraut/dacpt-aya

## Resumen

El modelo `ranjitraut/dacpt-aya` es un adaptador LoRA (PEFT) entrenado mediante aprendizaje supervisado (SFT) sobre el modelo base `CohereLabs/tiny-aya-base`. Este adaptador se publica con la librería `peft` y el pipeline de generación de texto, pero la información disponible es extremadamente limitada: la model card no contiene descripción, detalles de entrenamiento, evaluación ni licencia. El autor, Ranjit Raut, es un investigador con publicaciones académicas, pero no se aportan datos adicionales sobre el propósito o el proceso de ajuste.

Aunque el modelo base `tiny-aya-base` pertenece a la familia Aya de Cohere, orientada a instrucciones multilingües, no se ha confirmado que este adaptador herede esas capacidades ni qué tareas específicas aborda. Con 0.1 GB de tamaño, se trata de un adaptador ligero que requiere cargar el modelo base para funcionar. Dada la falta de documentación, su uso en producción no es recomendable sin una evaluación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre CohereLabs/tiny-aya-base) |
| Parametros totales | no disponible (el adaptador ocupa 0.1 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento
No se ha publicado información sobre la arquitectura interna del adaptador ni del modelo base `tiny-aya-base`. El modelo base pertenece a la familia Aya de Cohere, que en su versión original (`aya-101`) se basa en arquitectura mT5 y se entrenó con instrucciones en 101 idiomas, pero no se ha confirmado que `tiny-aya-base` siga esa misma arquitectura. En cuanto al entrenamiento, se indica que se usó `trl` (transformers reinforcement learning) y `sft` (supervised fine-tuning), pero no se documentan hiperparámetros, datos de entrenamiento ni procedimiento. La única referencia es que se utilizó la librería PEFT versión 0.20.0.

## Capacidades
- No se han documentado capacidades específicas para este adaptador.
- El modelo base `tiny-aya-base` no tiene ficha pública detallada; se desconoce si soporta generación de texto, razonamiento, código o multilingüismo.
- No se ha confirmado soporte de tool calling, agentes ni funciones especiales.
- La ausencia de información impide afirmar cualquier capacidad concreta.

## Casos de uso
No se puede proponer casos de uso concretos sin información sobre el comportamiento del modelo. Cualquier aplicación requeriría primero una evaluación empírica del adaptador y su integración con el modelo base. Hasta entonces, no se recomienda su uso en entornos productivos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- No se ha especificado VRAM ni GPUs recomendadas.
- Al ser un adaptador LoRA de 0.1 GB, la carga en memoria es mínima, pero se requiere el modelo base `tiny-aya-base` (tamaño desconocido). Si el modelo base es pequeño (por el nombre "tiny"), podría caber en GPUs de consumo, pero no hay datos.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `peft` y `transformers` en Python; también podría convertirse a GGUF si se conoce el modelo base, pero no se ha documentado.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares
No se dispone de información de modelos comparables. El adaptador se basa en un modelo de Cohere, pero no hay datos de rendimiento ni de características para comparar.

## Limitaciones y advertencias
- La model card no contiene información sobre sesgos, alucinaciones ni limitaciones técnicas.
- El adaptador es un componente que requiere el modelo base `CohereLabs/tiny-aya-base`; no es un modelo autónomo.
- La licencia no está definida, lo que impide usos comerciales sin clarificación legal.
- No se han documentado restricciones de idioma ni de contexto.
- Dada la falta de datos, el modelo no debe considerarse apto para producción sin una validación independiente.

## Enlaces
- [Modelo en Hugging Face](https://huggingface.co/ranjitraut/dacpt-aya)
- [Perfil del autor en Hugging Face](https://huggingface.co/ranjitraut)
- [Paper de Aya (original)](https://arxiv.org/abs/2402.07827)
- [Modelo CohereLabs/aya-101](https://huggingface.co/CohereLabs/aya-101)
