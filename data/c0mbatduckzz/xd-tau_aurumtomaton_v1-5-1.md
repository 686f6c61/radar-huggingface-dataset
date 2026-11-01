# c0mbatduckzz/XD-TAU_AURUMTOMATON_v1.5.1

## Resumen

XD-TAU AURUMTOMATON v1.5.1 no es un modelo de lenguaje entrenado, sino una especificación arquitectónica matemática publicada como documento PDF de 87 páginas en un repositorio de HuggingFace. Lo desarrolla Tom Klootwijk, que figura como autor y propietario, y la edición está fechada el 1 de noviembre de 2026 sobre la base de XD-TAU v1.5 (13 de octubre de 2026). El repositorio no contiene pesos neuronales preentrenados ni servicio de inferencia alojado: su contenido es el PDF con 23 archivos adjuntos incrustados, entre ellos scripts de referencia en Python.

El documento describe un marco integrado para estado tipado, geometría, campos, evolución ordenada y adaptadores físicos. Extiende la arquitectura XD-TAU v1.5 con acciones de automorfismo explícitas, dinámica equivariante, adaptadores térmicos y químicos, transiciones exactas de intercambio de grafos mediante aritmética racional, muestras continuas exactas, cambios de representación y registros de realización física para especímenes, calibración y observaciones.

Su relevancia en el contexto de un blog de modelos open source es limitada y de naturaleza distinta a la de un checkpoint convencional: se trata de material de investigación con licencia propietaria, sin concesión de derechos, y con evidencia de conformidad computacional (19/19 comprobaciones superadas) pero sin resultados de benchmarks de lenguaje. Cualquier evaluación debe tratar el artefacto como una especificación formal reproducible, no como un modelo desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Especificación matemática de estado tipado, geometría, campos, evolución ordenada y adaptadores físicos (no es una red neuronal publicada) |
| Parámetros totales | no disponible (sin pesos neuronales) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no aplica) |
| Idiomas soportados | en |
| Licencia | Propietaria; todos los derechos reservados; no se concede ninguna licencia (proprietary, all-rights-reserved, no-license-granted, personal-property) |
| Formato de pesos | no disponible; el repositorio contiene un PDF de 87 páginas con 23 adjuntos incrustados (scripts Python y JSON) |

## Arquitectura y entrenamiento

La arquitectura descrita es un marco formal, no un transformer ni un modelo híbrido SSM. Se articula en torno a estado tipado, geometría, campos, evolución ordenada y adaptadores físicos, y la edición v1.5.1 añade acciones de automorfismo explícitas, dinámica equivariante, adaptadores térmicos y químicos, transiciones exactas de intercambio de grafos con aritmética racional exacta, muestras continuas exactas, cambios de representación y registros de realización física (especímenes, calibración, observaciones).

No se documenta ningún proceso de entrenamiento con tokens, composición de dataset, RLHF ni DPO, porque el artefacto no incluye pesos entrenados. La evidencia de conformidad proviene de un script de referencia (`aurumtomaton_reference.py`, Python 3.10+ con `fractions.Fraction`) que se volvió a ejecutar de forma independiente con Python 3.12.10, superando 19/19 comprobaciones y coincidiendo con el array de resultados incrustado. La cobertura finita reportada incluye 256 perfiles de grafo y 1.024 casos de estado, simetría, inventarios tipados, muestras continuas exactas y agregación exacta. El dataset de observaciones físicas es explícitamente `null`: los campos de especímenes, calibración y observación permanecen simbólicos en esta edición.

## Capacidades

- Publicación de una especificación arquitectónica formal con ecuaciones de dominio y construcciones AURUMTOMATON.
- Reproducción computacional mediante un script de referencia en Python con aritmética racional exacta.
- Verificación de conformidad: 19/19 comprobaciones superadas en la reejecución independiente.
- Cobertura de 256 perfiles de grafo y 1.024 casos de estado en las pruebas reportadas.
- Definición de acciones de automorfismo y dinámica equivariante.
- Adaptadores térmicos y químicos descritos a nivel de especificación.
- Transiciones exactas de intercambio de grafos y muestras continuas exactas.
- Registros de realización física (especímenes, calibración, observaciones) a nivel simbólico.
- No dispone de generación de texto, razonamiento, código, matemáticas conversacionales, visión, tool calling, agentes ni capacidades multilingües más allá del inglés del documento.

## Casos de uso

- Revisión académica de marcos formales: investigadores en métodos formales pueden leer la especificación de 87 páginas y contrastar las ecuaciones de dominio con la literatura citada en cada capítulo.
- Reproducción de resultados: ejecutar `python aurumtomaton_reference.py` desde el directorio de adjuntos extraídos permite regenerar `aurumtomaton_results.json` y validar la conformidad de las 19 comprobaciones.
- Auditoría de aritmética exacta: el uso de `fractions.Fraction` permite verificar transiciones de intercambio de grafos y agregaciones sin error de redondeo en entornos de simulación.
- Estudio de dinámica equivariante: sirve como referencia conceptual para quienes diseñan simulaciones con simetrías y acciones de automorfismo explícitas.
- Integración en pipelines de verificación formal: los JSON de resultados, reproducción y registro editorial pueden incorporarse a herramientas de comprobación continua para detectar desviaciones respecto a la especificación.
- Documentación de procedencia: los 23 adjuntos (18 heredados y 5 nuevos) y el archivo `SHA256SUMS` permiten trazar la integridad byte a byte de la publicación para archivo y citación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es de conformidad computacional: 19/19 comprobaciones superadas, con cobertura de 256 perfiles de grafo y 1.024 casos de estado.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos neuronales que cargar.
- GPU recomendadas: no aplica; la reproducción se ejecuta en CPU con Python 3.10+ (probado con Python 3.12.10) y, para los programas heredados, NumPy.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama o TGI no son relevantes); el artefacto se consume como PDF y scripts.
- Latencia y throughput: no disponibles; no se reportan tiempos de ejecución del script de referencia.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría; el artefacto es una especificación arquitectónica propietaria sin pesos, por lo que la comparación con checkpoints de lenguaje no es significativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no puede desplegarse como servicio de inferencia.
- Licencia propietaria con todos los derechos reservados: no se concede permiso expreso ni implícito para uso, copia, modificación, distribución, sublicencia, comercialización, entrenamiento de modelos ni creación de datasets.
- El aviso de propiedad se hereda sin cambios de XD-TAU-JKT y no constituye una concesión de licencia.
- El dataset de observaciones físicas es `null`; los campos de especímenes, calibración y observación son simbólicos, no datos empíricos.
- La extensión matemática, edición, computación y preparación del documento se declaran asistidas por IA, lo que conviene tener en cuenta al evaluar la autoría.
- Idioma limitado al inglés del documento.
- Sin benchmarks de rendimiento publicados más allá de la conformidad computacional.
- Riesgo de confusión: el nombre y la presentación en HuggingFace pueden llevar a esperar un checkpoint; conviene tratar el repositorio como publicación documental.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/c0mbatduckzz/XD-TAU_AURUMTOMATON_v1.5.1
- Especificación completa (PDF, 87 páginas): https://huggingface.co/c0mbatduckzz/XD-TAU_AURUMTOMATON_v1.5.1/resolve/main/XD-TAU_AURUMTOMATON_v1.5.1.pdf
- Aviso de propiedad y reserva de derechos: https://huggingface.co/c0mbatduckzz/XD-TAU_AURUMTOMATON_v1.5.1/blob/main/PROPRIETARY_NOTICE.txt
- Checksums de integridad: https://huggingface.co/c0mbatduckzz/XD-TAU_AURUMTOMATON_v1.5.1/blob/main/SHA256SUMS
- Publicación anterior XD-TAU-JKT: https://huggingface.co/c0mbatduckzz/XD-TAU-JKT
- Repositorio fuente en GitHub (commit e78bb43): https://github.com/TomKlootwijk/AURUMTOMATON
