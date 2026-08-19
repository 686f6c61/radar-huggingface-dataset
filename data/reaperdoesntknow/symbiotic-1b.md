# reaperdoesntknow/Symbiotic-1B

## Resumen

Symbiotic-1B (también denominado SymbioticLM-1B) es un modelo de generación de texto desarrollado por Convergent Intelligence LLC, bajo el perfil de HuggingFace `reaperdoesntknow`. Se trata de un híbrido simbólico-transformer construido sobre el backbone de Qwen3-0.6B, al que se añaden módulos de procesamiento simbólico (ThoughtDynamicsLNN, CrystallineProcessor, LiquidThoughtProcessor y HelicalDNAProcessor) y una memoria episódica persistente de 2048 vectores simbólicos. A pesar de su nombre, el modelo tiene 596 millones de parámetros reales (según los pesos safetensors), por lo que se sitúa en la gama de modelos compactos.

El modelo está diseñado para razonamiento simbólico en entornos con recursos limitados, como agentes de investigación, asistentes ligeros o procesamiento lógico con eficiencia de memoria. Su relevancia radica en la integración de un pipeline simbólico con un transformer clásico, una aproximación poco común en el ecosistema open source. Se entrenó sobre un dataset de razonamiento avanzado en cálculo (0xZee/dataset-CoT-Advanced-Calculus-268) y se enmarca en la teoría del "Discrepancy Calculus", un enfoque matemático para controlar la discrepancia entre el comportamiento esperado y el real del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrido simbólico-transformer (backbone Qwen3-0.6B + módulos simbólicos) |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (fuentes externas indican 33K, no confirmado oficialmente) |
| Tipos de cuantizacion | No disponible (servicios externos ofrecen FP4, FP8, INT4) |
| Idiomas soportados | Inglés (en) |
| Licencia | AFL-3.0 (Academic Free License) |
| Formato de pesos | Safetensors y PyTorch (model.bin) |

## Arquitectura y entrenamiento

La arquitectura combina un transformer rotatorio de Qwen3-0.6B con una serie de módulos simbólicos que procesan representaciones de alta dimensión (dimensión simbólica de 1024). Estos módulos incluyen una red LNN de dinámica de pensamiento (ThoughtDynamicsLNN), un procesador cristalino basado en grafos convolucionales de ADN (CrystallineProcessor con DNAConv GNN), un procesador de pensamiento líquido (LiquidThoughtProcessor) y un procesador de ADN helicoidal (HelicalDNAProcessor). Además, el modelo incorpora una memoria episódica persistente de 2048 vectores simbólicos con recuperación entrópica y contextual, y un "Dream Mode" que permite simulación simbólica mediante un generador de pensamientos.

El entrenamiento se realizó sobre el dataset `0xZee/dataset-CoT-Advanced-Calculus-268`, especializado en cadenas de razonamiento para cálculo avanzado. No se especifican el número de tokens ni el uso de técnicas como RLHF o DPO. El modelo se enmarca en el marco teórico del Discrepancy Calculus (DISC), que trata las singularidades del entrenamiento (plateaus de pérdida, colapso de modos, olvido catastrófico) como señales estructurales de la geometría del problema de aprendizaje. Este marco introduce conceptos como el operador de discrepancia, los conjuntos de salto y el "ghost imprinting" para transferencia de conocimiento.

## Capacidades

- Generación de texto y razonamiento simbólico con memoria episódica persistente.
- Razonamiento matemático avanzado, especialmente en cálculo (entrenado específicamente en cadenas de razonamiento de cálculo).
- Planificación procedural y modelado matemático.
- Generación de código de pequeña escala.
- Explicaciones basadas en grafos (gracias al procesador cristalino con GNN).
- Modo "Dream" para simulación simbólica y generación de pensamientos.
- Recuperación contextual de memoria simbólica mediante control entrópico.
- Soporte de tokens simbólicos especiales (`<THM>`, `<LEM>`, `<D_IF>`) para representar teoremas, lemas y condicionales.
- No se especifica soporte de tool calling, visión ni audio.

## Casos de uso

- Agentes educativos con memoria: el modelo puede mantener un historial simbólico persistente de las interacciones del estudiante, permitiendo adaptar las explicaciones matemáticas al progreso individual gracias a su memoria episódica de 2048 vectores.
- Razonamiento lógico en dispositivos embebidos: su tamaño compacto (596M parámetros) y su optimización para CPU lo hacen adecuado para ejecutar razonamiento simbólico en Raspberry Pi o sistemas de borde sin GPU.
- Planificación procedural en robótica o automatización: los módulos simbólicos y la memoria contextual permiten descomponer tareas complejas en pasos lógicos verificables, útil para pipelines de control.
- Modelado matemático en investigación: el entrenamiento en cálculo avanzado y la generación de cadenas de razonamiento (CoT) facilitan la exploración de demostraciones o la verificación de pasos intermedios en problemas de análisis.
- Generación de código pequeño para scripts de automatización: aunque no es su fortaleza, puede producir fragmentos de código simple con razonamiento paso a paso, útil en entornos con restricciones de memoria.
- Explicación de conceptos basada en grafos: el CrystallineProcessor (GNN) permite generar explicaciones que representan relaciones entre conceptos, útil para sistemas de tutoría inteligente o visualización de dependencias lógicas.
- Prototipado de agentes conversacionales ligeros: su capacidad de mantener memoria simbólica persistente y su bajo consumo lo hacen apto para chatbots de nicho en inglés en entornos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K u otras métricas estándar en la model card ni en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16 (~1,2 GB de pesos), cabe en cualquier GPU con al menos 2 GB de VRAM. Con cuantización INT4, el uso de memoria se reduce a aproximadamente 0,4-0,5 GB, lo que permite ejecución en GPU integradas o incluso en CPU.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050, etc.) es suficiente. También puede ejecutarse en CPU gracias a su tamaño reducido.
- Opciones de despliegue: compatible con HuggingFace Transformers, vLLM (según FriendliAI), llama.cpp (si se convierte a GGUF), y plataformas como FriendliAI o Antbase que ofrecen inferencia gestionada.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de ~0,6B, se espera una latencia baja (del orden de decenas de milisegundos por token en GPU moderna), pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Arquitectura | Notas |
|---|---|---|---|---|---|
| Symbiotic-1B | 596M | No disponible | AFL-3.0 | Híbrido simbólico-transformer | Memoria episódica, razonamiento matemático |
| Qwen3-0.6B (base) | 596M | 32K (original) | Apache 2.0 | Transformer denso | Modelo base sin módulos simbólicos |
| Qwen3-1.7B | 1,7B | 32K | Apache 2.0 | Transformer denso | Mayor capacidad, sin memoria simbólica |
| Llama-3.2-1B | 1,2B | 128K | Llama 3.2 | Transformer denso | Contexto largo, sin componentes simbólicos |

La comparativa muestra que Symbiotic-1B ofrece una propuesta única por su capa simbólica y memoria persistente, aunque su rendimiento bruto en tareas generales probablemente sea inferior a modelos densos de tamaño similar sin esa capa adicional. No se dispone de benchmarks para cuantificar esta diferencia.

## Limitaciones y advertencias

- Menos fluidez en lenguaje libre que modelos densos de tamaño similar, según la propia model card.
- La precisión simbólica depende de la calidad de la memoria y de su curado; una memoria mal mantenida degrada el rendimiento.
- El "Dream Mode" requiere warm-up o semilla simbólica para consultas complejas; sin ella, puede producir salidas incoherentes.
- Entrenado exclusivamente en inglés; no hay soporte multilingüe.
- No se especifican sesgos conocidos, pero al ser un modelo pequeño y entrenado en un dataset especializado (cálculo), su generalización a dominios generales es limitada.
- Licencia AFL-3.0: es una licencia de código abierto permisiva, similar a BSD, que permite uso comercial y modificación, pero requiere atribución. Conviene revisar los términos exactos para uso en producción.
- No se han publicado resultados de benchmarks, por lo que su rendimiento real en tareas estándar es desconocido.
- El nombre "1B" es engañoso: el modelo tiene 596M parámetros, lo que puede llevar a expectativas incorrectas sobre su capacidad.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/reaperdoesntknow/Symbiotic-1B
- Colección SymbioticAI (modelos relacionados): https://huggingface.co/collections/reaperdoesntknow/symbioticai-symbolic-transformers
- Inferencia gestionada en FriendliAI: https://friendli.ai/models/reaperdoesntknow/Symbiotic-1B
- Ficha en Antbase (contexto 33K): https://antbase.ai/models/symbiotic-1b
- Paper de Discrepancy Calculus (DOI: 10.57967/hf/8194): https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus
- Paper de Structure Over Scale (DOI: 10.57967/hf/8165): https://huggingface.co/reaperdoesntknow/Structure-Over-Scale
- Paper de DualMind Methodology (DOI: 10.57967/hf/8184): https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy
- Perfil del autor: https://huggingface.co/reaperdoesntknow
