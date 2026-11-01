# mehemet/HexWeaver-27B

## Resumen

HexWeaver-27B es un adaptador PEFT (LoRA) publicado por el usuario mehemet sobre el modelo base OBLITERATUS/Qwen3.8-27B-OBLITERATED, que a su vez deriva de la familia Qwen. El adaptador está especializado en tareas de ingeniería inversa, descompilación y análisis de binarios, con un enfoque explícito en el uso de herramientas como Ghidra (incluido su formato P-code), Z3 y solvers SMT, ejecución simbólica, deofuscación y verificación formal. El repositorio ocupa 0,6 GB, lo que es coherente con un conjunto de pesos LoRA y no con un modelo completo.

El modelo resuelve un nicho muy concreto: asistentes de código capaces de razonar sobre binarios, pseudocódigo descompilado, representaciones intermedias y restricciones formales, en lugar de limitarse a código fuente convencional. Entre sus etiquetas figuran también angr, control-flow-flattening, Tigress y OLLVM, lo que indica un entrenamiento orientado a reconocer y contrarrestar técnicas de ofuscación habituales en malware y en protección de software comercial.

Es relevante ahora porque combina un modelo base de gran tamaño (27B, según la nomenclatura del checkpoint) con un adaptador ligero y una licencia Apache 2.0, lo que facilita su integración en pipelines de análisis de seguridad. No obstante, el acceso está restringido (gated) en HuggingFace y el número de descargas es mínimo (1 en el momento de la consulta), por lo que se trata de un artefacto muy reciente y poco validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen, adaptador LoRA/PEFT) |
| Parametros totales | 27B en el modelo base (no disponible el desglose exacto del adaptador) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors del adaptador; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, tr |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT sobre OBLITERATUS/Qwen3.8-27B-OBLITERATED, un checkpoint de 27B de la familia Qwen. La arquitectura subyacente es, por tanto, un transformer decoder-only con atención estándar; el adaptador añade matrices de bajo rango entrenadas para el dominio de ingeniería inversa. La información disponible no detalla el rango del LoRA, las capas objetivo ni la configuración exacta de entrenamiento.

El entrenamiento se orienta a un conjunto de tareas muy específicas: descompilación asistida, análisis de binarios, generación y resolución de restricciones en Z3/SMT, ejecución simbólica con angr, deofuscación de binarios protegidos con Tigress u OLLVM y verificación formal. No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento técnico sobre código y binarios.
- Generación y análisis de pseudocódigo descompilado, incluido el formato P-code de Ghidra.
- Formulación y resolución de restricciones con Z3 y otros solvers SMT.
- Razonamiento sobre ejecución simbólica (angr) y análisis de flujo de control.
- Deofuscación de binarios: detección de control-flow flattening, ofuscación de Tigress y OLLVM.
- Verificación formal y razonamiento sobre propiedades de programas.
- Soporte de conversación multi-turno (pipeline text-generation, conversational).
- Capacidades multilingües limitadas a inglés y turco según los metadatos.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Análisis de malware: el adaptador puede asistir en la lectura de pseudocódigo descompilado y en la identificación de patrones de ofuscación (control-flow flattening, Tigress, OLLVM), acelerando el triaje inicial de muestras.
- Auditoría de binarios propietarios: generación de explicaciones en lenguaje natural del pseudocódigo extraído con Ghidra P-code, útil para revisar software sin código fuente.
- Resolución de restricciones en análisis simbólico: traducción de condiciones de path a fórmulas Z3/SMT y ayuda a interpretar los modelos resultantes en ejercicios de ejecución simbólica con angr.
- Formación y CTFs: asistente para retos de reversing, explicando técnicas de deofuscación y guiando la construcción de scripts de análisis.
- Verificación formal de fragmentos críticos: apoyo en la redacción de invariantes y consultas al solver en procesos de verificación de propiedades de seguridad.
- Documentación de hallazgos: generación de informes técnicos en inglés o turco a partir de trazas de análisis y resultados de herramientas, aprovechando el soporte de ambos idiomas.
- Integración en pipelines de CI de seguridad: uso como componente de revisión asistida sobre artefactos binarios antes de su despliegue, siempre con validación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,6 GB, pero requiere cargar el modelo base de 27B para la inferencia.
- VRAM estimada para el modelo base: aproximadamente 54 GB en FP16/BF16; en torno a 16-18 GB con cuantización de 4 bits (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: A100 80 GB o H100 para FP16; RTX 4090 (24 GB) viable solo con cuantización agresiva del modelo base.
- No cabe en GPUs de consumo con menos de 24 GB sin cuantización.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con la librería peft sobre transformers; para servir en producción pueden usarse vLLM o TGI tras fusionar el adaptador con el modelo base. No se documentan recetas para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HexWeaver-27B | 27B (base) + LoRA | no disponible | Reversing, SMT, deofuscación | apache-2.0 | Gated en HF |
| Qwen2.5-Coder (familia) | 1.5B–32B | hasta 128K en variantes grandes | Código general | Apache 2.0 (mayoría) | Pública |
| Modelos generalistas tipo Llama | 8B–70B | 8K–128K | Propósito general | Licencia comunitaria | Pública |

La comparación cuantitativa de rendimiento no está disponible al no haberse publicado benchmarks del adaptador.

## Limitaciones y advertencias

- Artefacto con muy poca validación comunitaria: 1 descarga y 1 like en el momento de la consulta.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargarlo.
- Idiomas limitados a inglés y turco; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación en la interpretación de binarios y en la generación de restricciones SMT: toda salida debe validarse con las herramientas reales (Ghidra, Z3, angr).
- No se documentan sesgos específicos ni evaluaciones de seguridad del adaptador.
- La licencia Apache 2.0 del adaptador no exime de comprobar las condiciones del modelo base OBLITERATUS/Qwen3.8-27B-OBLITERATED, que puede tener términos adicionales.
- Uso en producción desaconsejado sin una evaluación propia previa, dado el escaso soporte documental y la ausencia de benchmarks.

## Enlaces

- HuggingFace: https://huggingface.co/mehemet/HexWeaver-27B
- Modelo base: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Ghidra: https://ghidra-sre.org/
- Z3: https://github.com/Z3Prover/z3
- angr: https://github.com/angr/angr
