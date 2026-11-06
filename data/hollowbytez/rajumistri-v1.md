# HollowBytez/RajuMistri-V1

## Resumen

RajuMistri-V1 es un adaptador PEFT (LoRA) publicado por HollowBytez sobre el modelo base Qwen/Qwen2.5-Coder-0.5B-Instruct. Su propósito declarado es la generación autónoma de arquitectura voxel para Minecraft: el modelo produce secuencias de tokens estructurales que representan volúmenes, marcos y pendientes de tejado, y el autor indica que pueden exportarse a los formatos `.litematic` (mod Litematica) y `.schem` (Sponge / WorldEdit v2).

El modelo se presenta como un motor de arquitectura 3D especializado, entrenado según la model card sobre más de 11.000 esquemáticos reales de Minecraft. Se distribuye como adaptador LoRA en safetensors con licencia MIT, lo que permite reutilizarlo y combinarlo con el modelo base siempre que se respete la licencia de este último.

La relevancia es acotada pero clara para un nicho concreto: automatizar la creación de estructuras en Minecraft sin depender de un modelo generalista de gran tamaño. Al partir de un modelo de 0,5B parámetros, el coste de inferencia es muy bajo, aunque también lo es la capacidad de razonamiento general. El repositorio no incluye pipeline declarado, no tiene descargas ni likes en el momento de la consulta y no publica resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-Coder-0.5B-Instruct) con adaptador LoRA/PEFT |
| Parametros totales | 0,5B en el modelo base; el adaptador añade un número no especificado de parámetros entrenables (no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-Coder-0.5B-Instruct, valor no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors y puede combinarse con el base cuantizado (GGUF, AWQ, etc.) según herramientas externas |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen2.5-Coder-0.5B-Instruct, un transformer decoder-only de 0,5B parámetros. El adaptador se ha entrenado, según la model card, sobre más de 11.000 esquemáticos reales de Minecraft, con el objetivo de que el modelo emita tokens que codifiquen estructura voxel respetando profundidad, marcos y pendientes de tejado. No se detalla en la información disponible la composición exacta del dataset, el número de tokens de entrenamiento, la configuración de LoRA (rango, alpha, módulos objetivo) ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación declarada no está en la arquitectura, sino en la especialización del dominio: el adaptador convierte un modelo de código pequeño en un generador de descripciones estructurales exportables a `.litematic` y `.schem`. No se mencionan innovaciones de inferencia como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto especializado en descripciones de arquitectura voxel para Minecraft.
- Síntesis de tokens estructurales que representan volúmenes, marcos y pendientes de tejado.
- Exportación declarada a `.litematic` (Litematica) y `.schem` (Sponge / WorldEdit v2).
- Capacidad de código heredada del modelo base Qwen2.5-Coder-0.5B-Instruct, aunque no validada en la información disponible para esta ficha.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Generación de esquemáticos para servidores de construcción: el modelo produce descripciones estructurales que se convierten en `.litematic` o `.schem` para cargarlos en Litematica o WorldEdit, agilizando la creación de edificios en servidores creativos.
- Prototipado rápido de edificios en modpack: un desarrollador de mapas puede pedir variantes de una casa o castillo y revisar los esquemáticos generados antes de incorporarlos al mapa.
- Herramienta educativa de arquitectura voxel: sirve para mostrar cómo se descomponen volúmenes y tejados en una cuadrícula de bloques, con la ventaja de que el coste de inferencia es mínimo.
- Asistente dentro de un pipeline de generación de mapas: integrado como paso intermedio que traduce una especificación textual (dimensiones, estilo, materiales) a una estructura exportable, antes de un paso de validación geométrica.
- Automatización de contenido para creadores: generación por lotes de estructuras de relleno (casas, torres, muros) para poblar mundos de Minecraft sin diseñarlas manualmente.
- Base para fine-tuning adicional: al ser un adaptador LoRA MIT sobre un base pequeño, otro desarrollador puede continuar el entrenamiento con su propio conjunto de esquemáticos y estilos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en fp16 ocupa aproximadamente 1 GB de pesos; en cuantización de 4 bits, por debajo de 0,5 GB. El adaptador añade una sobrecarga pequeña no cuantificada en la información disponible.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para el base en fp16; una RTX 3060, RTX 4060 o superior ofrece margen holgado. Para despliegue en servidor, una T4 o A10 bastan; A100/H100 no son necesarias.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: Al ser un adaptador PEFT, requiere cargar el base Qwen2.5-Coder-0.5B-Instruct y aplicar el adaptador con `peft`. Para servir en producción, vLLM o TGI admiten adaptadores LoRA; llama.cpp y Ollama requieren fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del base, se espera latencia baja en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RajuMistri-V1 | 0,5B (base) + LoRA | no disponible | Minecraft / voxel / esquemáticos | MIT | Hugging Face (adaptador PEFT) |
| Qwen2.5-Coder-0.5B-Instruct | 0,5B | no disponible en esta ficha | Código general | Apache 2.0 (según el modelo base) | Hugging Face |
| Modelos generalistas de 7B (p. ej. Qwen2.5-Coder-7B-Instruct) | 7B | no disponible en esta ficha | Código general | Apache 2.0 (según el modelo base) | Hugging Face |

No se dispone de información sobre otros adaptadores especializados en Minecraft con los que comparar directamente; la comparativa se limita al modelo base y a alternativas generalistas de mayor tamaño.

## Limitaciones y advertencias

- Modelo muy pequeño (0,5B en el base): capacidad de razonamiento y de seguir instrucciones complejas limitada en comparación con modelos de 7B o superiores.
- Entrenado exclusivamente en inglés según la model card; el rendimiento en castellano no está validado.
- Especializado en un dominio muy concreto (Minecraft); fuera de ese dominio su utilidad es marginal.
- Riesgo de alucinación estructural: puede generar secuencias de tokens que no correspondan a esquemáticos válidos o geométricamente coherentes; se recomienda validación con Litematica o WorldEdit antes de usar en producción.
- Sin benchmarks publicados ni métricas de calidad objetivas; no hay evidencia cuantitativa de fidelidad estructural.
- Repositorio sin descargas ni likes en el momento de la consulta; no hay señales de adopción ni de mantenimiento.
- Licencia MIT para el adaptador, pero el uso comercial debe verificar también la licencia del modelo base Qwen2.5-Coder-0.5B-Instruct.
- No se documentan sesgos específicos, pero al derivar de un modelo de código general puede reproducir sesgos presentes en los datos del base.

## Enlaces

- Hugging Face: https://huggingface.co/HollowBytez/RajuMistri-V1
- GitHub del autor: https://github.com/hollowbytez
- YouTube del autor: https://www.youtube.com/@hollowbytez
- Instagram del autor: https://www.instagram.com/hollowbytez
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
