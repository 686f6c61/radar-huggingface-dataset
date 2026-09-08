# Snapkitty/bio-semantics

## Resumen

bio-semantics es un pipeline de modelado semántico de datos de expresión génica desarrollado por Snapkitty (autores Ahmad Ali Parr y Jessica L. Williams). No se trata de un modelo de lenguaje ni de un modelo de IA generativa, sino de una herramienta de bioinformática que combina inferencia bayesiana mediante Stan, razonamiento por restricciones con MiniZinc, validación de datos con reglas explícitas y una visualización en HTML con ocho paneles. El objetivo es proporcionar un flujo de trabajo reproducible y auditable para analizar datos de expresión génica (cDNA), verificar modificaciones postraduccionales (PTM) y mantener trazabilidad de cada valor desde su origen hasta el resultado computacional. Es relevante para laboratorios y entornos corporativos que necesitan integridad de datos y comunicación con sistemas IBM i (RPG) y JCL.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de modelado semántico en etapas: validación (semantics.py), inferencia bayesiana (Stan), razonamiento por restricciones (MiniZinc) y visualizador (dashboard.html) |
| Parámetros totales | no disponible (no es un modelo con parámetros entrenados) |
| Parámetros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la documentación está en inglés con anotaciones en chino y árabe) |
| Licencia | Triliencia: BSL-1.1 / AGPL-3.0 / MPL-2.0 (a elegir una) |
| Formato de pesos | no disponible (no hay pesos; contiene código Python, TypeScript, plantillas RPG/JCL y HTML) |
| Esquema de tipos | bio-semantics/1.0.0 (types.ts) |
| Reglas de validación | 10 reglas implementadas en semantics.py |
| Estado de fases | Gate 1 listo para revisión; Gate 2 y Gate 3 no iniciados |

## Arquitectura y entrenamiento

La arquitectura del pipeline se organiza en etapas: los datos de observaciones biológicas se validan mediante un módulo `semantics.py` que implementa diez reglas de validación, entre ellas rechazo de versiones no soportadas, identificadores duplicados, valores NaN o infinito y unidades ausentes. Los datos validados alimentan un modelo bayesiano en Stan que calcula distribuciones posteriores, y después un modelo de restricciones en MiniZinc que aplica relaciones y optimización. El resultado se envía a un visualizador HTML de ocho paneles. No se ha proporcionado información sobre entrenamiento, ya que no hay pesos entrenados ni datos de entrenamiento, RLHF o DPO. El proyecto incluye una máquina de estados para verificación de paridad PTM (`ptm-bit-parity/1`) que define transiciones de lectura y escritura para mantener un estado de paridad constante.

## Capacidades

- Validación de datos de expresión génica con diez reglas implementadas en `semantics.py`.
- Inferencia bayesiana con Stan, incluyendo priors, likelihood y posterior.
- Razonamiento por restricciones y optimización con MiniZinc.
- Visualización interactiva en un dashboard HTML con ocho paneles.
- Trazabilidad de procedencia mediante siete tipos de cantidad: observed, inferred, derived, predicted, constrained, encoded y executed.
- Verificación de modificaciones postraduccionales (PTM) mediante máquina de paridad de bits con transiciones de estado.
- Soporte de integración con sistemas IBM i mediante plantillas RPG (`workflow.rpgle`) y JCL (`vault.jcl`).
- No soporta generación de texto, razonamiento general, código, visión ni tool calling, al no ser un modelo de lenguaje.

## Casos de uso

- Análisis de expresión génica con inferencia bayesiana: los investigadores pueden modelar niveles de expresión de genes a partir de cDNA usando Stan para obtener distribuciones posteriores con incertidumbre.
- Validación de datos en laboratorios de secuenciación: antes de cualquier análisis, se aplican las diez reglas de validación para detectar valores duplicados, unidades incorrectas o muestras no resueltas.
- Verificación de integridad de modificaciones postraduccionales: la máquina de paridad PTM permite comprobar que las lecturas y escrituras de datos mantienen la paridad esperada, útil en controles de calidad.
- Auditoría de procedencia en estudios genómicos: gracias a los quantity kinds, se puede trazar el origen y destino de cada valor (observado, inferido, derivado, etc.) en publicaciones y auditorías.
- Integración en entornos corporativos con IBM i: las plantillas RPG y JCL facilitan el despliegue en sistemas centrales de grandes organizaciones.
- Visualización de resultados para equipos multidisciplinares: el dashboard HTML con ocho paneles permite que biólogos y analistas revisen el modelo y sus resultados sin necesidad de conocimientos de Stan o MiniZinc.
- Cumplimiento de licencias en servicios en la nube: para empresas que quieran ofrecer funcionalidades basadas en este pipeline como SaaS, es imprescindible conocer la trilicencia y divulgar el código fuente si aplica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se ha publicado información sobre VRAM ni requisitos de GPU.
- El pipeline se ejecuta como un conjunto de scripts de Python y modelos Stan/MiniZinc, por lo que no requiere aceleración por GPU.
- Para la inferencia bayesiana se recomienda una CPU con varios núcleos, pero no hay datos concretos de rendimiento.
- No se han documentado opciones de despliegue específicas como vLLM, llama.cpp, Ollama o TGI, porque no es un modelo de lenguaje.
- No hay datos de latencia ni throughput disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en HuggingFace, ya que bio-semantics no es un modelo de IA generativa sino un pipeline de software para bioinformática con integración en mainframe. En el ecosistema HuggingFace no existe una categoría equivalente.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo de IA generativa; no puede responder preguntas, generar texto ni ejecutar tareas de razonamiento lingüístico.
- No se han publicado benchmarks ni métricas de rendimiento, por lo que no se puede evaluar su calidad frente a otras herramientas.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido probado por la comunidad.
- La puerta 2 (motor) y la puerta 3 (integración) están marcadas como "Not started", lo que significa que partes del pipeline no están completas o no han sido verificadas.
- La licencia trilicencia impone restricciones de redistribución: el README indica que la redistribución como SaaS en la nube sin divulgación del código fuente está prohibida bajo las tres licencias.
- El proyecto depende de Stan y MiniZinc, lo que añade complejidad de instalación y mantenimiento.
- La documentación incluye términos en chino y árabe sin traducción al inglés, lo que puede limitar su accesibilidad.
- No se han descrito sesgos conocidos, pero al no estar validado externamente, el riesgo de errores en las reglas de validación no puede descartarse.

## Enlaces

- HuggingFace: https://huggingface.co/Snapkitty/bio-semantics
- Búsqueda de modelos de Snapkitty en HuggingFace: https://huggingface.co/models?other=snapkitty
- No se han encontrado papers, blogs, repositorios adicionales o demos en la información disponible.
