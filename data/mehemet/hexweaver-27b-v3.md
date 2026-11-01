# mehemet/HexWeaver-27B-v3

## Resumen

HexWeaver-27B-v3 es un adaptador PEFT (LoRA) publicado por el usuario mehemet en HuggingFace, orientado a tareas de ingeniería inversa, descompilación y análisis de binarios. El repositorio no contiene un modelo base completo, sino un conjunto de pesos de adaptación (0,3 GB) que debe aplicarse sobre un modelo base de 27B parámetros no especificado en la ficha del repositorio. La especialización declarada abarca dominios muy concretos: análisis con Ghidra y su representación P-code, resolución con el solver SMT Z3, verificación formal, ejecución simbólica (angr), deofuscación de binarios protegidos con Tigress y OLLVM, y generación de código en el contexto de seguridad de software.

El modelo se presenta como una herramienta vertical para flujos de trabajo de ciberseguridad ofensiva y defensiva, donde un LLM debe razonar sobre representaciones intermedias de bajo nivel (P-code, trazas simbólicas, restricciones SMT) en lugar de código fuente de alto nivel. Es relevante porque pocos modelos abiertos están afinados específicamente para este nicho, y menos aún con soporte declarado para formatos intermedios como el P-code de Ghidra o la salida de Z3.

La información pública disponible es muy limitada: cero descargas, cero likes, repositorio con acceso restringido (gated) y sin datos de benchmarks, arquitectura del modelo base ni detalles del dataset de entrenamiento. Los idiomas declarados son inglés y turco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador PEFT/LoRA sobre modelo base de 27B no especificado) |
| Parametros totales | 27B (según el nombre del modelo; del modelo base, no del adaptador) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, tr |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente pesos de adaptación en formato PEFT (probablemente LoRA, dado el tamaño de 0,3 GB), que deben combinarse con un modelo base de 27B parámetros cuyo nombre no se indica en la información disponible. La arquitectura subyacente del transformer base, el número de tokens de entrenamiento, la composición del dataset y si se aplicaron técnicas de RLHF, DPO o SFT no están documentados en los metadatos proporcionados.

Las etiquetas del repositorio sugieren un entrenamiento orientado a tareas muy específicas: representación P-code de Ghidra, restricciones y modelos Z3, ejecución simbólica con angr, y patrones de ofuscación de flujo de control (control-flow flattening) generados por Tigress y OLLVM. Esto implica que el dataset de ajuste probablemente contiene pares de binarios/artefactos intermedios y sus análisis correspondientes, aunque no se dispone de detalles cuantitativos.

## Capacidades

- Generación de texto y razonamiento conversacional en inglés y turco.
- Análisis de binarios y asistencia en ingeniería inversa, con énfasis en el ecosistema Ghidra.
- Manejo de la representación intermedia P-code de Ghidra para razonar sobre semántica de instrucciones.
- Generación y resolución de restricciones SMT para el solver Z3.
- Verificación formal y ejecución simbólica (angr) como dominio declarado.
- Deofuscación de binarios protegidos con Tigress y OLLVM, incluyendo control-flow flattening.
- Generación de código en contextos de seguridad de software.
- Soporte de tool calling y function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Análisis de funciones descompiladas en Ghidra: el modelo puede recibir P-code o pseudocódigo y generar explicaciones semánticas o renombrar variables y funciones con criterios de ingeniería inversa.
- Deofuscación de binarios con OLLVM: dado que el ajuste incluye patrones de control-flow flattening, se puede emplear para reconstruir el flujo de control original a partir de grafos ofuscados.
- Generación de scripts de Ghidra (Python/Java) para automatizar tareas repetitivas de análisis, aprovechando el conocimiento del ecosistema declarado en las etiquetas.
- Formulación de restricciones Z3: el modelo puede traducir condiciones de path de un binario a fórmulas SMT y ayudar a resolverlas o simplificarlas.
- Ejecución simbólica con angr: asistencia en la construcción de scripts de exploración de paths, definición de hooks y análisis de estados simbólicos.
- Formación y CTFs: como tutor para explicar técnicas de ofuscación, verificación formal y análisis de binarios en entornos educativos.
- Revisión de seguridad de software: análisis de artefactos compilados en pipelines de auditoría, generando informes sobre construcciones sospechosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador PEFT ocupa 0,3 GB, pero requiere cargar el modelo base de 27B parámetros para su uso.
- VRAM estimada para el modelo base en FP16: aproximadamente 54 GB, lo que exige GPUs de 80 GB (A100, H100) o múltiples GPUs.
- En cuantización de 8 bits: aproximadamente 27 GB, viable en una A100 40 GB o en dos RTX 4090.
- En cuantización de 4 bits: aproximadamente 14-16 GB, viable en una RTX 4090 (24 GB) o RTX 3090.
- El adaptador en sí es ligero y no añade requisitos significativos de memoria.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` de HuggingFace junto con `transformers`; para servir en producción se podría usar vLLM o TGI si el modelo base lo soporta, aunque no está confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos abiertos comparables específicamente afinados para Ghidra P-code, Z3 y deofuscación de OLLVM/Tigress con los que establecer una comparación rigurosa a partir de la información proporcionada.

## Limitaciones y advertencias

- El repositorio está restringido (gated): es necesario aceptar condiciones en HuggingFace para acceder a los pesos.
- No se especifica el modelo base sobre el que se aplica el adaptador, lo que impide evaluar su comportamiento real y dificulta la reproducibilidad.
- Sin benchmarks publicados, no hay evidencia cuantitativa de su rendimiento en las tareas declaradas.
- Cero descargas y cero likes: no hay validación comunitaria ni informes de uso.
- Idiomas limitados a inglés y turco; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación en la generación de restricciones SMT o scripts de análisis, con posible producción de código sintácticamente válido pero semánticamente incorrecto.
- El uso en producción de seguridad requiere validación humana: un error en la interpretación de un binario o en una restricción Z3 puede llevar a conclusiones erróneas.
- Licencia Apache 2.0 declarada, pero al ser un adaptador sobre un modelo base no identificado, las condiciones finales dependen también de la licencia de dicho modelo base.
- No hay información sobre sesgos, datos de entrenamiento ni evaluación de seguridad del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mehemet/HexWeaver-27B-v3
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
