# mehemet/HexWeaver-27B-v4

## Resumen

HexWeaver-27B-v4 es un adaptador PEFT (LoRA) publicado por el usuario mehemet en Hugging Face, orientado a tareas de ingeniería inversa, descompilación y análisis de binarios. El repositorio no contiene pesos completos de un modelo base, sino un conjunto de adaptadores de bajo rango (0,2 GB) que se aplican sobre un modelo base de aproximadamente 27 mil millones de parámetros, presumiblemente un transformer denso de la familia Llama o similar. Los tags del repositorio lo especializan en dominios muy concretos: Ghidra y su representación PCode, el solver SMT Z3, verificación formal, ejecución simbólica con angr, deobfuscación de binarios protegidos con Tigress y OLLVM, y flattening de flujo de control.

El modelo resuelve un problema específico del sector de seguridad: la falta de asistentes de IA entrenados para razonar sobre representaciones intermedias de bajo nivel (PCode, IR de angr, fórmulas SMT) en lugar de código fuente de alto nivel. Es relevante porque permite automatizar partes del análisis de malware y de la desobfuscación que tradicionalmente requieren ingeniería manual. La licencia es Apache 2.0, los idiomas declarados son inglés y turco, y el acceso está restringido (gated), por lo que se requiere aceptar condiciones en Hugging Face antes de descargar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base no especificado en el repo); adaptador PEFT/LoRA |
| Parametros totales | ~27B (según el nombre del modelo; no confirmado en la ficha del repo) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors del adaptador; la cuantización dependerá del modelo base) |
| Idiomas soportados | inglés (en), turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base debe obtenerse por separado |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un adaptador PEFT en formato safetensors, no de un modelo completo. Esto implica que HexWeaver-27B-v4 se aplica sobre un checkpoint base de ~27B parámetros que no se distribuye en este repositorio; el usuario debe emparejarlo con la base correcta para que los pesos LoRA carguen. El tamaño del repo (0,2 GB) es coherente con un adaptador de bajo rango sobre un modelo denso de ese tamaño, no con pesos completos.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o ajuste supervisado. Los tags sugieren un corpus especializado en análisis de binarios, PCode de Ghidra, fórmulas Z3, trazas de ejecución simbólica y muestras ofuscadas con Tigress/OLLVM, pero la ficha del repositorio no documenta la metodología de entrenamiento. Tampoco se detalla ninguna innovación técnica como decodificación especulativa o atención lineal; no disponible.

## Capacidades

- Generación de texto conversacional en inglés y turco, con registro técnico de seguridad.
- Razonamiento sobre representación intermedia PCode de Ghidra y sobre IR de angr.
- Generación y análisis de fórmulas SMT para el solver Z3, orientadas a verificación formal.
- Asistencia en ejecución simbólica: construcción de constraints, path conditions y consultas al solver.
- Deobfuscación de binarios: reconocimiento de patrones de Tigress y OLLVM, incluido control-flow flattening.
- Generación de código auxiliar para scripts de reversing (Python, probablemente integrado con Ghidra/angr).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita; los tags sugieren flujos multi-paso de análisis, pero no está documentado.
- Capacidades multimodales (visión, audio): no disponible.

## Casos de uso

- Triaje de malware: el adaptador puede analizar funciones descompiladas y PCode para identificar rutinas de cifrado, anti-debug o empaquetadores, reduciendo el tiempo de revisión manual en muestras desconocidas.
- Desobfuscación de binarios protegidos con Tigress/OLLVM: reconocer patrones de control-flow flattening y proponer transformaciones de simplificación sobre el IR de angr.
- Generación de scripts de Ghidra: producir código Python para automatizar extracción de funciones, renombrado y anotación de símbolos a partir de la representación PCode.
- Construcción de consultas Z3: traducir condiciones de path de angr a fórmulas SMT legibles y comprobables, útil en verificación formal de rutinas críticas.
- Análisis de firmware y binarios embebidos: asistir en la reconstrucción de lógica de protocolos propietarios a partir de desensamblado, con el modelo como copiloto del analista.
- Formación y CTFs: entorno de práctica para investigadores que quieran comparar estrategias de deobfuscación o resolver retos de reversing con asistencia del modelo.
- Documentación de hallazgos: generar informes técnicos en inglés o turco a partir de trazas de análisis simbólico, útil para equipos de respuesta a incidentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; dependerá del modelo base de ~27B y de la cuantización elegida (un 27B en FP16 requiere del orden de 54 GB solo para pesos, antes de KV cache).
- GPU recomendadas: no disponible; por tamaño del base, cabría esperar A100 80GB, H100 o múltiples RTX 4090, pero no está confirmado.
- ¿Cabe en consumer GPU? No disponible; un 27B cuantizado a 4 bits podría caber en GPUs de 24 GB, pero no hay datos del repo que lo confirmen.
- Opciones de despliegue: al ser un adaptador PEFT, se cargaría con transformers + peft sobre el base; para serving, vLLM, TGI o llama.cpp requerirían fusionar el adaptador con el base primero. No documentado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (asistentes especializados en reversing y verificación formal), y no se dispone de datos de rendimiento para establecer una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio contiene solo el adaptador PEFT; sin el modelo base correcto, los pesos no son utilizables. La base no está identificada en la información disponible.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar, lo que puede complicar pipelines automatizados.
- Idiomas limitados a inglés y turco; el castellano no está declarado como soportado.
- Riesgo de alucinación elevado en dominios de bajo nivel: el modelo puede inventar offsets, nombres de funciones o constraints SMT plausibles pero incorrectos; toda salida debe validarse con Ghidra, angr o Z3.
- Sesgos conocidos: no disponible; no hay documentación de evaluación de sesgos.
- Licencia Apache 2.0 permite uso comercial, pero la licencia del modelo base subyacente puede imponer restricciones adicionales que prevalecen.
- Sin datos de benchmarks, no hay evidencia publicada de calidad frente a alternativas; el despliegue en producción debería ir precedido de una evaluación propia.
- El repositorio muestra 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/mehemet/HexWeaver-27B-v4
- Ghidra (referencia del dominio): https://ghidra-sre.org/
- angr (referencia del dominio): https://angr.io/
- Z3 (referencia del dominio): https://github.com/Z3Prover/z3
- Tigress (referencia del dominio): https://tigress.wtf/
- OLLVM (referencia del dominio): https://github.com/obfuscator-llvm/obfuscator
