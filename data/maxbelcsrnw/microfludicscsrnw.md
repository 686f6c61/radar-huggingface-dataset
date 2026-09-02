# maxbelCSRNW/microfludicsCSRNW

## Resumen

MegaNet SciML Studio V16.1 es un modelo híbrido de aprendizaje automático científico (SciML) para el diseño y análisis de sistemas microfluídicos a gran escala, desarrollado por el autor maxbelCSRNW y publicado bajo licencia Apache 2.0. Combina un solucionador hidráulico exacto de redes de canales con modelos neuronales informados por la física (PINN/XPINN) locales, de modo que la conservación global de masa y presión nunca depende de las redes neuronales, sino que estas solo aportan correcciones locales verificadas.

El modelo aborda un problema concreto: el diseño inverso y la optimización de redes microfluídicas complejas (hasta 65.536 salidas en configuraciones de árbol balanceado), incluyendo generadores de gotas en T-junction, análisis de incertidumbre por tolerancias de fabricación y obstrucciones, y flujo bifásico reducido. Es un repositorio de código de investigación (MVP) en PyTorch, no un endpoint de inferencia alojado, y se ejecuta principalmente mediante un cuaderno de Google Colab.

Su relevancia radica en que propone una arquitectura de trabajo híbrida que evita los problemas de convergencia y escalabilidad de los PINN puros al restringir su uso a correcciones locales, manteniendo la exactitud del solucionador de red. Incluye un modo de investigación opcional que integra el benchmark público DeepCFD como capa de validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: solucionador hidráulico exacto de redes + XPINN local (physics-informed neural network extendida) |
| Parametros totales | no disponible (el tamaño de las redes neuronales locales no se especifica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica (modelo de código científico, no de pesos preentrenados) |
| Idiomas soportados | en, ru (documentación y código) |
| Licencia | Apache 2.0 |
| Formato de pesos | Código fuente Python + cuaderno Jupyter (PyTorch) |

## Arquitectura y entrenamiento

El sistema combina tres capas complementarias. En primer lugar, un solucionador hidráulico exacto que resuelve la red completa de canales microfluídicos imponiendo conservación de masa y presión a nivel de red. En segundo lugar, un XPINN local (extended physics-informed neural network) que se entrena sobre contracciones geométricas representativas y produce correcciones de resistencia hidráulica, sujeto a una puerta de calidad física independiente que audita el resultado antes de transferirlo a elementos equivalentes. En tercer lugar, una capa opcional de CFD de alta fidelidad basada en el benchmark DeepCFD (Zenodo DOI 10.5281/zenodo.3665511) que se utiliza únicamente para casos difíciles o fuera de distribución.

El flujo de trabajo PINN recomendado es: construcción de la red real, resolución exacta completa, identificación de una contracción representativa, entrenamiento y auditoría del XPINN local, transferencia de la corrección aceptada a elementos equivalentes, re-resolución exacta de la red completa y cálculo de incertidumbre y métricas de diseño. Los datos de entrenamiento específicos no se detallan más allá de las referencias abiertas citadas (DeepCFD y DAFD 3.0, DOI 10.1038/s41467-023-44068-3). No se menciona el uso de RLHF, DPO ni técnicas similares, que no aplican a este tipo de modelo.

## Capacidades

- Resolución hidráulica exacta de redes de canales microfluídicos a gran escala, sin depender de aproximaciones neuronales para la conservación global.
- Cálculo especializado de árboles balanceados con hasta 65.536 salidas.
- Corrección local de contracciones mediante XPINN con puerta de calidad física independiente.
- Flujo de trabajo bifásico para matrices de generadores de gotas en T-junction, con cierre físico reducido informado por la física.
- Análisis de incertidumbre por tolerancias de fabricación y obstrucciones.
- Diseño inverso y optimización geométrica con restricciones.
- Validación externa opcional mediante el benchmark DeepCFD.
- Interfaz gráfica en cuadernos Colab/Jupyter.
- Soporte de transitorios hidráulicos opcionales y flujo Newtoniano y generalizado-Newtoniano laminar.

## Casos de uso

- Diseño de chips microfluídicos para laboratorio en chip: el modelo permite explorar rápidamente el espacio de diseño geométrico de redes de canales, obteniendo soluciones hidráulicas exactas sin necesidad de CFD resuelto para cada iteración.
- Matrices de generadores de gotas: el flujo de trabajo bifásico permite dimensionar redes de alimentación para arrays de T-junctions, prediciendo el comportamiento de generación de gotas con un cierre físico reducido.
- Análisis de tolerancias de fabricación: el módulo de incertidumbre cuantifica cómo las variaciones dimensionales propias de los procesos de fabricación (litografía blanda, micromecanizado) afectan a la distribución de caudales y presiones en la red.
- Detección de obstrucciones: el análisis de incertidumbre por bloqueo permite identificar qué elementos de la red son más sensibles a obstrucciones parciales y cómo estas alteran el comportamiento global.
- Diseño inverso de geometrías: la optimización con restricciones permite encontrar geometrías de canales que cumplan especificaciones de caudal o presión objetivo, reduciendo el número de prototipos físicos necesarios.
- Investigación académica y formación en SciML: el repositorio sirve como banco de pruebas para comparar estrategias híbridas (solucionador exacto + PINN local) frente a PINN puros, y para docencia en aprendizaje automático informado por la física.
- Preparación de candidatos para simulación de alta fidelidad: el modelo genera geometrías candidatas que posteriormente se validan con CFD resuelto o experimentación, acotando el espacio de búsqueda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (p. ej., errores de predicción de caudales frente a CFD de referencia) en la información disponible. El repositorio cita el benchmark DeepCFD (Zenodo DOI 10.5281/zenodo.3665511) y el dataset DAFD 3.0 (DOI 10.1038/s41467-023-44068-3) como material de referencia para validación y cierres locales, pero no se proporcionan métricas numéricas específicas del modelo.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en Google Colab, por lo que no requiere hardware especializado en su configuración básica.
- Los requisitos de VRAM no se especifican; al ser un modelo de código que entrena redes neuronales locales de pequeño tamaño, es probable que quepa en GPUs de consumo (p. ej., T4 de Colab), pero no hay datos confirmados.
- El solucionador hidráulico exacto es computacionalmente ligero al ser un problema de red, no de CFD resuelto.
- El modo de investigación con DeepCFD puede requerir más recursos, dependiendo de la resolución de los casos CFD.
- Opciones de despliegue: cuaderno Colab, script Python local, Jupyter. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la misma categoría (híbrido de solucionador exacto + XPINN para microfluídica). Como referencia de aproximaciones alternativas:

| Modelo/Enfoque | Tipo | Alcance | Licencia | Disponibilidad |
|---|---|---|---|---|
| MegaNet SciML Studio V16.1 | Híbrido (solucionador exacto + XPINN local) | Redes microfluídicas, diseño inverso, incertidumbre | Apache 2.0 | Código abierto en HuggingFace |
| PINN puros (p. ej., DeepXDE) | Redes neuronales informadas por la física | Ecuaciones diferenciales generales, sin escalado a redes completas | Apache 2.0 (DeepXDE) | Código abierto |
| DeepCFD benchmark | Dataset de CFD para entrenamiento de redes | Flujo en geometrías 2D | Sujeto a términos del dataset | Zenodo |

La diferencia clave es que MegaNet no intenta resolver la física completa con redes neuronales, sino que combina un solucionador exacto con correcciones locales auditadas, lo que evita los problemas de convergencia y escalabilidad típicos de los PINN puros en dominios grandes.

## Limitaciones y advertencias

- El modelo es un MVP de investigación, no una herramienta de diseño validada para uso en fabricación o aplicaciones clínicas. El propio autor lo indica explícitamente.
- El alcance se limita a flujo laminar Newtoniano y generalizado-Newtoniano en redes microfluídicas, con transitorios hidráulicos opcionales.
- No es adecuado para fenómenos de ruptura de gotas compleja, coalescencia, mojado fuertemente fuera de dominio, deformación de paredes u otras físicas fuera de los cierres implementados.
- No sustituye a CFD de interfaz resuelta para casos que requieran alta fidelidad en la descripción de la interfaz bifásica.
- Los datos de entrenamiento de las redes neuronales locales no se especifican en detalle; la validación depende de las referencias abiertas citadas (DeepCFD, DAFD 3.0).
- No se han publicado métricas de error o benchmarks cuantitativos que permitan evaluar la precisión del modelo frente a soluciones de referencia.
- El repositorio tiene cero descargas y cero likes en HuggingFace, lo que sugiere que no ha sido ampliamente probado por la comunidad.
- La licencia Apache 2.0 permite uso comercial del código, pero los datasets y benchmarks externos (DeepCFD, DAFD 3.0) están sujetos a sus propios términos y requieren citación.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/maxbelCSRNW/microfludicsCSRNW
- Benchmark DeepCFD (Zenodo): DOI 10.5281/zenodo.3665511
- Dataset DAFD 3.0: DOI 10.1038/s41467-023-44068-3
