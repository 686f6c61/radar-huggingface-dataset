# ChatterjeeLab/CupOFMoCA

## Resumen

CupOFMoCA es un modelo de generación molecular desarrollado por ChatterjeeLab, presentado en el artículo "CupOFMoCA: Coupled Objective-Guided Discrete Flows for Molecular Conjugate Assembly" en NeurIPS 2026. Se trata de un sistema de flujos discretos (discrete flows) diseñado específicamente para el ensamblaje de conjugados moleculares, una clase de fármacos cuya función emerge de la interacción entre múltiples componentes químicos. A diferencia de los modelos generativos de moléculas convencionales, CupOFMoCA genera componentes acoplados imponiendo restricciones de validez de ensamblaje durante todo el proceso de muestreo y guiando las transiciones locales mediante objetivos de propiedad.

El modelo cubre dos modalidades de conjugados: conjugados fármaco-péptido (PDC), donde genera el carrier peptídico que se ensambla con un payload y un linker de química fija, y PROTAC, donde genera el linker que conecta un warhead fijo con un ligando de E3 ligasa. La liberación incluye pesos, configuraciones, código de generación y salidas reportadas para sistemas concretos: ERBB2, GNRHR y NRP1 en PDC, y EGFR-VHL, BRD9-VHL y CDK6-CRBN en PROTAC.

Es relevante porque aborda un problema poco tratado en generación molecular: la generación condicionada por múltiples componentes con restricciones de validez química estrictas, en lugar de la generación de moléculas aisladas. El repositorio ocupa 2,1 GB e incluye entornos conda, checkpoints y verificadores de integridad con hashes SHA-256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flujos discretos (discrete flow) con guiado por objetivos acoplados; base SMILESReDi, PepReDi o UAAReDi en PDC y DeFoG afinado en PROTAC |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (longitudes de secuencia SMILES de 80 para ERBB2 y GNRHR, 100 para NRP1; 10 para AA y UAA) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de química molecular, no de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints PyTorch (.ckpt); el repo incluye artefactos verificables por SHA-256 |

## Arquitectura y entrenamiento

CupOFMoCA se basa en flujos discretos, un paradigma generativo que modela transiciones entre estados discretos (por ejemplo, tokens de SMILES o grafos moleculares) mediante un proceso de flujo en lugar de difusión continua. La innovación central es el acoplamiento de objetivos: el muestreo impone restricciones de validez de ensamblaje en cada paso y guía las transiciones locales con funciones objetivo de propiedad, de modo que los componentes generados sean químicamente compatibles con el contexto fijo (payload, linker o anclajes).

En la modalidad PDC, el generador base es SMILESReDi, PepReDi o UAAReDi, según la representación elegida (SMILES, aminoácidos naturales o aminoácidos no naturales). La configuración del artículo emplea 128 pasos de optimización con pesos objetivo iguales y un constructor de conjugación específico por diana. En la modalidad PROTAC, se afina DeFoG sobre linkers de PROTAC-DB y se muestrea con 1.500 pasos, 100 pasos de calentamiento, una puerta dura de validez y pesos de objetivos suaves de 4,0 para accesibilidad sintética, 2,0 para cercanía al quimiotipo de PROTAC-DB y 4,0 para conectividad. Los experimentos reportados usan semillas 42, 123 y 456 con 100 candidatos por semilla. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición completa del dataset.

## Capacidades

- Generación de péptidos carrier en tres representaciones: SMILES, aminoácidos naturales (AA) y aminoácidos no naturales (UAA).
- Ensamblaje de conjugados fármaco-péptido con payload y química de conjugación fijos para las dianas ERBB2, GNRHR y NRP1.
- Generación de linkers PROTAC como subgrafo molecular entre un warhead fijo y un ligando de E3 ligasa, para los sistemas EGFR-VHL, BRD9-VHL y CDK6-CRBN.
- Muestreo guiado por objetivos (`guided`) y muestreo por etapas (`staged`) en la modalidad PDC.
- Imposición de restricciones de validez de ensamblaje durante el muestreo (puerta dura de validez en PROTAC).
- Optimización multiobjetivo configurable mediante pesos (accesibilidad sintética, cercanía a quimiotipos conocidos, conectividad).
- Verificación de integridad de artefactos mediante hashes SHA-256 y comprobación de rutas.
- No se documentan capacidades de tool calling, agentes, visión, audio ni procesamiento de lenguaje natural.

## Casos de uso

- Diseño de conjugados fármaco-péptido para oncología dirigida: el modelo genera carriers peptídicos compatibles con la química de conjugación de payloads específicos para dianas como ERBB2, lo que permite explorar el espacio de péptidos manteniendo la viabilidad de ensamblaje.
- Descubrimiento de ligandos peptídicos con aminoácidos no naturales: la representación UAA permite generar secuencias que incorporan residuos no canónicos, útiles para mejorar estabilidad proteolítica o afinidad, con el muestreo guiado ajustando propiedades objetivo.
- Diseño de degradadores PROTAC: la generación de linkers entre warheads y ligandos de E3 ligasa (VHL, CRBN) acelera la exploración de quimiotipos de linker, un cuello de botella clásico en el desarrollo de PROTAC.
- Optimización multiobjetivo de candidatos: los pesos configurables permiten priorizar accesibilidad sintética, similitud con quimiotipos validados en PROTAC-DB o conectividad, adaptando la generación a las restricciones de un proyecto concreto.
- Reproducción de experimentos publicados: las configuraciones `paper.json`, las semillas fijas y los verificadores de integridad permiten reproducir las salidas del artículo para auditoría o comparación de métodos.
- Integración en pipelines de química computacional: el código PyTorch y los entornos conda permiten incorporar la generación a flujos existentes de filtrado, docking o dinámica molecular (el release PROTAC incluye un flujo de dinámica molecular).
- Evaluación comparativa de métodos generativos: sirve como referencia para investigar flujos discretos guiados frente a difusión u otros paradigmas en generación molecular condicionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia el artículo de NeurIPS 2026 y los programas de evaluación incluidos en cada modalidad, pero no incluye cifras numéricas de métricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (2,1 GB) incluye pesos, entornos y artefactos, pero no se desglosa el tamaño de cada checkpoint.
- GPU recomendadas: se recomienda una GPU CUDA para la generación; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Entorno de despliegue: Python 3.9 y CUDA 12.1 mediante entornos conda (`cupofmoca` para PDC, `defog` para PROTAC); no se mencionan vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. La configuración PROTAC usa 1.500 pasos de muestreo con 100 pasos de calentamiento para 100 candidatos por lote, lo que da una indicación del coste computacional del muestreo, pero sin tiempos medidos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de generación molecular ni datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Modelo especializado en química molecular: no es un modelo de lenguaje y no admite prompts en lenguaje natural ni tareas generales de texto.
- Cobertura limitada de dianas y sistemas: solo se liberan ERBB2, GNRHR y NRP1 (PDC) y EGFR-VHL, BRD9-VHL y CDK6-CRBN (PROTAC); otros sistemas requieren construir configuraciones propias.
- Dependencia de contextos fijos: el payload, la química de conjugación, el warhead y el ligando E3 deben estar predefinidos; el modelo no los genera.
- Riesgo de candidatos no viables: aunque se imponen restricciones de validez de ensamblaje, las moléculas generadas requieren validación experimental; no se reportan tasas de éxito sintético o biológico en la información disponible.
- Sesgos de datos: el entrenamiento sobre PROTAC-DB y conjuntos de péptidos puede favorecer quimiotipos sobrerrepresentados, lo que el peso de cercanía a quimiotipo (2,0) mitiga parcialmente pero no elimina.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de las dependencias (DeFoG, PROTAC-DB) y de los datos de entrenamiento subyacentes.
- Reproducibilidad dependiente del entorno: los entornos fijados a Python 3.9 y CUDA 12.1 pueden requerir ajustes en sistemas más recientes; el verificador de integridad ayuda a detectar artefactos corruptos.
- Sin datos publicados de benchmarks en la información disponible, por lo que la evaluación de calidad debe hacerse mediante los programas incluidos en el release.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChatterjeeLab/CupOFMoCA
- Guía PDC: https://huggingface.co/ChatterjeeLab/CupOFMoCA/tree/main/CupOFMoCA-PDC (README.md incluido)
- Guía PROTAC: https://huggingface.co/ChatterjeeLab/CupOFMoCA/tree/main/CupOFMoCA-PROTAC (README.md incluido)
- Documentación de la CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/cli
- Artículo: "CupOFMoCA: Coupled Objective-Guided Discrete Flows for Molecular Conjugate Assembly", NeurIPS 2026 (enlace al paper no disponible en la información proporcionada)
