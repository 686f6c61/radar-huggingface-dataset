# Snapkitty/sovereign-agi-kernel

## Resumen

El repositorio `Snapkitty/sovereign-agi-kernel` no contiene un modelo de inteligencia artificial convencional (tipo LLM o red neuronal), sino un *kernel* de verificación formal escrito en Idris 2 y Lean 4, presentado por su autor como un sistema que garantiza invariantes de seguridad mediante tipos dependientes. La idea central es que cualquier afirmación matemática proveniente de un componente AGI debe pasar por un proceso de verificación tipada antes de ser aceptada, eliminando la necesidad de monitoreo en tiempo real o de pruebas empíricas.

El proyecto declara cinco axiomas fundamentales —límite de entropía, relación activo/confiable, artefacto como prueba, cadena WORM de solo añadido y el kernel como ancla única de confianza— todos implementados como tipos, de modo que violarlos resulta en errores de compilación en lugar de fallos en ejecución. También incluye un oráculo combinatorio basado en la suma de subconjuntos distintos (DSS) con aplicaciones en aislamiento de fallos, tomografía de red, criptografía de umbral y análisis financiero.

En el momento de la consulta, el repositorio tiene cero descargas y cero *likes* en HuggingFace, y su fecha de creación es el 3 de septiembre de 2026. No se dispone de información sobre pipeline, licencia oficial en metadatos ni idiomas soportados, aunque la *model card* menciona una tri-licencia (BSL-1.1 / AGPL-3.0 / MPL-2.0) y el código está documentado en inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernel de verificación formal con tipos dependientes (Idris 2 + Lean 4); no es una red neuronal |
| Parametros totales | no disponible (no es un modelo de ML) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible (código y documentación en inglés) |
| Licencia | Tri-licencia BSL-1.1 / AGPL-3.0 / MPL-2.0 (según *model card*; metadatos de HuggingFace: no disponible) |
| Formato de pesos | no aplica (código fuente: archivos `.idr`, `.lean`, `.mjs`, `.py`) |

## Arquitectura y entrenamiento

Este proyecto no sigue el paradigma de entrenamiento de modelos de aprendizaje automático. En su lugar, emplea teoría de tipos dependientes (basada en el cálculo de construcciones de Martin-Löf) para que el compilador de Idris 2 actúe como verificador de pruebas. La especificación y la implementación son el mismo artefacto: si el código no satisface las invariantes declaradas en los tipos, no compila. El módulo `SovereignKernel.idr` define un oráculo de razonamiento con límite de entropía (fijado en `LTE n 20`), mientras que `AgentModel.idr` garantiza que un agente activo no pueda ser no confiable (tipo inhabitado). La cadena WORM (`WORM_Audit.idr`) carece de constructor de eliminación, haciendo imposible el borrado por construcción.

En el lado matemático, el directorio `lean/Erdos/` contiene pruebas formalizadas en Lean 4 sobre la cota greedy de Erdős-Straus para el problema de suma de subconjuntos distintos (DSS). Esta cota se utiliza en el runtime JavaScript (`greedy.mjs`, `fault-isolation.mjs`, etc.) para reducir la búsqueda en un 98% en el aislamiento de fallos, y para calcular cardinalidades de conjuntos a partir de sumas agregadas sin enumerar miembros. No hay fase de entrenamiento, RLHF ni ajuste de pesos; la validación se realiza mediante compilación y pruebas unitarias en un pipeline de CI de cinco etapas.

## Capacidades

- Verificación formal de invariantes críticos mediante tipos dependientes: el compilador rechaza programas que violen los axiomas declarados.
- Prueba matemática de propiedades combinatorias (cota de Erdős-Straus) formalizada en Lean 4.
- Oráculo de cardinalidad DSS (Distinct Subset Sum) para estimar el número de elementos de un conjunto a partir de sumas agregadas, sin enumeración explícita.
- Aislamiento de fallos con reducción del 98% en el espacio de búsqueda, basado en el orden de interacción de señales de prueba.
- Tomografía de red con conteo de paquetes de tamaño constante a partir de ACKs agregados.
- Criptografía de umbral que permite contar firmantes sin revelar identidades.
- Detección de *structuring* financiero (anti-lavado) mediante conteo de canales.
- Integración con Python a través de un *gate* (`agi_gate.py`) que fuerza el paso de cualquier afirmación por el kernel.
- Cadena de auditoría WORM (write-once, read-many) con inmutabilidad garantizada por tipos.
- No incluye generación de texto, razonamiento conversacional, visión, audio ni tool calling típico de modelos de IA generativa.

## Casos de uso

- **Verificación de sistemas críticos de IA**: cualquier componente AGI que produzca afirmaciones matemáticas puede ser conectado al kernel para que solo se acepten resultados verificados formalmente, reduciendo el riesgo de alucinaciones en entornos donde la corrección es obligatoria (por ejemplo, diagnóstico médico o control de infraestructuras).
- **Auditoría de cadenas de bloques**: la cadena WORM puede emplearse como capa de integridad para registros inmutables, garantizando por tipos que no existe operación de borrado o modificación.
- **Análisis de redes y telemetría**: el oráculo DSS permite inferir el número de flujos de red a partir de agregados de ACK, útil en monitorización de tráfico sin necesidad de inspeccionar paquetes individuales.
- **Criptografía de umbral con privacidad**: contar firmantes válidos sin revelar sus identidades, aplicable a esquemas de firmas múltiples en protocolos descentralizados.
- **Cumplimiento financiero y anti-lavado**: detección de patrones de *structuring* (depósitos fraccionados) mediante el conteo de canales de transacción, útil para entidades bancarias.
- **Validación de razonamiento en agentes autónomos**: integrar el kernel como única vía de aceptación de conclusiones en agentes que operan en dominios de alto riesgo (por ejemplo, trading algorítmico), donde un error lógico puede causar pérdidas significativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de modelos de IA (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El repositorio no contiene métricas de rendimiento comparativas con otros sistemas de verificación formal ni con modelos de ML. La *model card* menciona una "reducción del 98% en la búsqueda" para el aislamiento de fallos, pero no se proporcionan datos experimentales detallados ni tiempos de ejecución medidos.

## Requisitos de hardware

- No requiere GPU para su funcionamiento; es un conjunto de código fuente que se compila con Idris 2 y Lean 4.
- Necesita un compilador de Idris 2 (versión no especificada) y Lean 4, además de Node.js para los scripts de runtime y Python 3 para el *gate* de integración.
- La compilación de los módulos Idris 2 y Lean 4 puede consumir memoria considerable (se estima varios GB), pero es factible en una estación de trabajo estándar con 8-16 GB de RAM.
- Para el despliegue en producción, se puede usar el Dockerfile proporcionado, que define un build multi-etapa "air-gapped".
- No aplican opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de inferencia.
- La latencia y el throughput dependen del tamaño de las pruebas y de la complejidad de las afirmaciones verificadas; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA comparable con LLMs u otros sistemas de ML. En el ámbito de la verificación formal podría compararse con asistentes de pruebas como Coq, Agda o Isabelle, pero no se han realizado comparativas publicadas en la información disponible, y la naturaleza del proyecto (kernel para AGI) es específica.

## Limitaciones y advertencias

- No es un modelo de IA generativa: no genera texto, código ni respuestas conversacionales.
- Las afirmaciones de la *model card* son muy ambiciosas ("first AGI kernel", "sovereign AGI") y no han sido validadas por terceros; se basan únicamente en la descripción del autor.
- El autor declara no tener un doctorado y se presenta como contribuidor de Liquid Haskell, pero no se ha verificado su trayectoria.
- La licencia tri-licencia (BSL-1.1 / AGPL-3.0 / MPL-2.0) implica condiciones específicas para uso comercial y de red; la BSL-1.1 puede restringir el uso en producción hasta que se libere, y la AGPL-3.0 obliga a divulgar el código fuente en despliegues de red.
- No hay evidencia de que el sistema funcione en entornos reales; el repositorio tiene cero descargas y cero *likes*, y no se aportan resultados de pruebas exhaustivas.
- La fecha de creación (2026-09-03) es posterior a la actualidad en el momento de redactar esta ficha; esto podría indicar un error en los metadatos o una publicación programada.
- La dependencia de Idris 2 y Lean 4 puede suponer una curva de aprendizaje y un mantenimiento complejo en producción.
- El oráculo DSS se basa en la conjetura de Erdős-Straus, que aún no está demostrada en general; aunque el autor afirma haber formalizado una cota en Lean 4, la validez matemática completa depende de esa conjetura.

## Enlaces

- Repositorio en HuggingFace: [Snapkitty/sovereign-agi-kernel](https://huggingface.co/Snapkitty/sovereign-agi-kernel)
- No se han encontrado otros enlaces (papers, blogs o repositorios externos) en la información proporcionada.
