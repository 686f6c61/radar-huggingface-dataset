# Rajkhush/Pylab

## Resumen

El repositorio `Rajkhush/Pylab` contiene un prototipo funcional llamado "AAAO Ecosystem Bottleneck Lab", desarrollado por el autor Rajkhush. No se trata de un modelo de inteligencia artificial generativa, sino de una aplicación web construida con Gradio que tiene como objetivo diagnosticar cuellos de botella en ecosistemas empresariales desde una perspectiva teórica. La herramienta integra datos de diversas fuentes (Tracxn, YNOS, PATSTAT, Startup India/DPIIT, entre otras) y aplica un marco de análisis basado en la Teoría de Restricciones y en el enfoque AAAO (Actor, Asset, Activity, Outcome) para identificar desajustes entre las etapas de desarrollo de las empresas y los dominios de apoyo disponibles.

El prototipo calcula métricas de desajuste, cobertura y prioridad ponderada por evidencia de forma determinista, y genera informes técnicos sin necesidad de una API externa. Opcionalmente, permite una síntesis narrativa mediante un modelo de lenguaje externo, pero esto no es parte del núcleo del sistema. La relevancia del proyecto radica en su enfoque metodológico para el diagnóstico de ecosistemas de emprendimiento, más que en ofrecer un modelo de IA entrenado. No se dispone de información sobre arquitectura de red neuronal, tamaño de parámetros ni longitud de contexto, ya que no aplica en el sentido convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (aplicacion Gradio, no modelo de red neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la interfaz esta en ingles, no se especifican otros) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no aplica) |

## Arquitectura y entrenamiento

La arquitectura del proyecto es de software, no de red neuronal. Consta de varios módulos interconectados: un módulo de integración de datos que lee hojas de cálculo y exportaciones de fuentes como Tracxn, un módulo de clasificación por etapas (venture-development states), un módulo de extracción de documentos PDF/DOCX/TXT para políticas y normativas, y un motor de análisis que calcula desajustes entre dominios y etapas. El diagnóstico se basa en una matriz de "Venture × Estado de desarrollo × Dominio de apoyo", donde los dominios son Tecnología, Finanzas, Organizaciones de Apoyo al Emprendimiento (ESO), Contratación Pública y Aprobación Regulatoria.

No hay proceso de entrenamiento de un modelo de IA. El sistema utiliza reglas deterministas y lógica de puntuación ponderada por evidencia. La síntesis opcional de lenguaje se delega en una API externa (por ejemplo, OpenAI) configurable mediante una clave, pero el prototipo no incorpora pesos ni arquitectura propia de modelo de lenguaje.

## Capacidades

- Integración de datasets de ecosistemas empresariales: Tracxn, YNOS, PATSTAT, Startup India/DPIIT, subvenciones, contratación pública, regulación, ESO, Prowess/MCA o datasets personalizados.
- Clasificación automática de empresas en etapas de desarrollo (concepción, desarrollo, comercialización, tracción, crecimiento, escala) a partir de variables observables.
- Detección de variables de etapa en archivos con nombres comunes como `technology stage`, `finance stage`, `procurement stage`, `regulatory stage`.
- Diagnóstico de desajustes entre dominios y etapas mediante el marco AAAO y la Teoría de Restricciones.
- Generación de informes deterministas con puntuaciones de prioridad ponderadas por evidencia.
- Extracción de texto de documentos PDF, DOCX y TXT para integrar políticas, misiones, esquemas y normativas.
- Síntesis narrativa opcional mediante un modelo de lenguaje externo (requiere API key, no se escribe en disco).
- Mapeo personalizado de columnas para fuentes de datos no estándar.

## Casos de uso

- Diagnóstico de ecosistemas de emprendimiento regionales: un analista carga datos de Tracxn y documentos de políticas locales, y la herramienta identifica en qué dominios (financiación, regulación, etc.) las empresas se encuentran más rezagadas respecto a su etapa de desarrollo.
- Evaluación de programas de apoyo público: organismos de desarrollo económico pueden subir datos de subvenciones y contratación pública para comprobar si la cobertura de apoyo se alinea con las necesidades de las empresas en distintas fases.
- Investigación académica en emprendimiento: investigadores pueden integrar datasets de patentes (PATSTAT) y datos regulatorios para analizar la relación entre aprobaciones y avance de startups, usando el marco AAAO para localizar mecanismos causales.
- Consultoría estratégica para aceleradoras: una aceleradora puede cargar su propio dataset de empresas y detectar qué tipo de soporte (ESO, financiero, tecnológico) está infrarepresentado en etapas críticas.
- Análisis de políticas de innovación: responsables de políticas pueden subir documentos de estrategia y esquemas de apoyo para verificar si las condiciones marco definidas en los documentos se corresponden con los desajustes observados en los datos.
- Auditoría de datos de ecosistemas: la herramienta sirve para comprobar la calidad y cobertura de datasets como Tracxn, señalando qué dominios carecen de evidencia directa (por ejemplo, contratación pública o regulación) y evitando conclusiones precipitadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se requiere GPU para el funcionamiento principal; es una aplicación Python con interfaz Gradio que se ejecuta en CPU.
- Los requisitos de VRAM no aplican al no ser un modelo de red neuronal.
- Para la síntesis opcional con LLM externo, se necesita conexión a internet y una API key, pero el cómputo se realiza en el servidor del proveedor.
- El despliegue se realiza localmente mediante `python aaao_app.py` tras instalar las dependencias de `requirements.txt`.
- No se mencionan opciones de despliegue en vLLM, llama.cpp, Ollama o TGI, ya que no se trata de un modelo de lenguaje servible por esos entornos.
- La latencia y el throughput dependen del volumen de datos y de la extracción de documentos; no hay cifras publicadas.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de inteligencia artificial comparable con otros modelos de lenguaje o de razonamiento. Se trata de una herramienta de análisis de ecosistemas empresariales, por lo que no existen modelos equivalentes en el ámbito de los modelos fundacionales.

## Limitaciones y advertencias

- No es un modelo de lenguaje generativo; la generación de texto solo es posible mediante una API externa opcional, y la calidad de dicha síntesis depende del proveedor y de la clave configurada.
- El prototipo no fuerza esquemas arbitrarios de PATSTAT, contratación pública o regulación a etapas automáticamente; se requieren adaptadores específicos para producción.
- Según el propio autor, "missing is not weak": la ausencia de evidencia regulatoria, de contratación pública o de ESO en los datos no implica que la función no exista, sino que no es observable en los datasets seleccionados.
- "Mismatch is not yet a binding constraint": los desajustes transversales se reportan como restricciones candidatas, no como restricciones confirmadas. Se necesita evidencia longitudinal para afirmar que el desajuste retrasa o impide el avance.
- La prioridad de las restricciones se pondera por evidencia; un desajuste grande con datos escasos no supera automáticamente a un desajuste menor pero bien observado.
- Las menciones de contratación pública o regulación solo en Tracxn se tratan como señales contextuales y no cuentan como cobertura directa de transacciones o administrativa.
- La aplicación no escribe la API key en disco, pero se debe tener cuidado al introducir claves en el campo de contraseña.
- El repositorio tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que se trata de un proyecto temprano o sin difusión.

## Enlaces

- HuggingFace: https://huggingface.co/Rajkhush/Pylab
