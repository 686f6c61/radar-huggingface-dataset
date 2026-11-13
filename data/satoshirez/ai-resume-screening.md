# SatoshiRez/AI-Resume-Screening

## Resumen

AI-Resume-Screening es un repositorio alojado en Hugging Face bajo el identificador SatoshiRez/AI-Resume-Screening. A pesar de la nomenclatura de la plataforma, no se trata de un modelo de lenguaje con pesos publicados, sino de una aplicacion de cribado de curriculos descrita en su model card. La aplicacion compara el texto de un curriculum con el de una oferta de empleo mediante tecnicas de procesamiento de lenguaje natural y produce una puntuacion de similitud orientada a apoyar decisiones de reclutamiento.

La model card describe un sistema construido en Python 3.11 con Streamlit como interfaz web, scikit-learn para el componente de aprendizaje automatico y Pandas para el manejo de datos. El flujo de trabajo declarado es: preprocesado de texto, procesamiento NLP, extraccion de caracteristicas, calculo de similitud y presentacion de la puntuacion en un panel interactivo. No se especifica que algoritmo concreto de similitud ni que modelo de embeddings se emplea.

El repositorio no publica pesos, arquitectura de red neuronal, tokenizador ni artefactos de inferencia descargables. La relevancia actual es limitada como modelo open source evaluable, pero resulta ilustrativo como ejemplo de aplicacion NLP de recuperacion y emparejamiento textual en el dominio de recursos humanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card describe una aplicacion NLP basada en scikit-learn, sin arquitectura de red neuronal publicada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible en los metadatos de Hugging Face; la model card muestra un badge MIT para el proyecto |
| Formato de pesos | no disponible (no se publican pesos) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre arquitectura de modelo, numero de parametros, corpus de entrenamiento, numero de tokens procesados ni tecnicas de alineacion como RLHF o DPO. La model card indica que el sistema utiliza tecnicas de NLP y scikit-learn para extraer caracteristicas textuales y calcular una puntuacion de similitud entre curriculum y oferta, pero no detalla el pipeline concreto: no se especifica si emplea TF-IDF, bolsas de palabras, embeddings preentrenados o similitud coseno sobre vectores.

El apartado de hoja de ruta futura menciona la incorporacion de modelos transformer basados en BERT, lo que sugiere que la version actual no utiliza transformers. Tampoco se documentan procesos de evaluacion, conjuntos de validacion ni metricas de calidad del emparejamiento.

## Capacidades

- Analisis de texto de curriculos: procesamiento y limpieza del contenido textual de un curriculum.
- Comparacion con ofertas de empleo: emparejamiento entre el texto del curriculum y la descripcion del puesto.
- Calculo de puntuacion de similitud: generacion de un porcentaje de coincidencia entre candidato y oferta.
- Extraccion de caracteristicas textuales mediante NLP.
- Panel interactivo en Streamlit para introducir textos y visualizar resultados.
- Procesamiento de datos tabulares con Pandas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- No se documenta capacidad multilingue; la hoja de ruta menciona soporte multi-idioma como trabajo futuro.

## Casos de uso

- Triaje inicial de candidaturas: un reclutador introduce el texto de un curriculum y el de una oferta y obtiene una puntuacion de similitud que le permite priorizar la revision manual. Es adecuado porque el sistema esta disenado explicitamente para ese flujo.
- Filtrado de grandes volumenes de curriculos en texto plano: al procesar textos con Pandas y scikit-learn, puede aplicarse por lotes para ordenar candidaturas antes de la revision humana.
- Prototipo docente de NLP aplicado a RRHH: sirve como ejemplo funcional de pipeline de preprocesado, extraccion de caracteristicas y similitud para cursos o talleres.
- Validacion de descripciones de puesto: comparar una oferta con curriculos de referencia para detectar si la descripcion atrae perfiles alineados.
- Demo interna de cribado asistido: desplegar la aplicacion Streamlit en un entorno controlado para que el equipo de seleccion experimente con el flujo antes de adoptar herramientas comerciales.
- Base para extensiones con transformers: la hoja de ruta contempla BERT, analisis de brechas de habilidades y puntuacion de compatibilidad ATS, por lo que puede servir como esqueleto de un sistema mas avanzado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al no publicarse pesos ni arquitectura neuronal, no procede estimacion de VRAM. La aplicacion descrita se ejecuta como proceso Python con Streamlit y scikit-learn, por lo que el requisito principal es CPU y memoria RAM.
- GPU recomendadas: no aplica para la version descrita; no se requiere GPU para ejecutar scikit-learn en este contexto.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: ejecucion local con `streamlit run app.py` segun la model card; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio no publica un modelo de lenguaje comparable en parametros, contexto o rendimiento; las alternativas habituales en cribado de curriculos (sistemas basados en embeddings como Sentence-BERT o APIs comerciales de matching) no se han evaluado contra este proyecto en la informacion proporcionada.

## Limitaciones y advertencias

- No se publican pesos ni artefactos de inferencia, por lo que no es posible reproducir ni auditar el comportamiento del sistema a partir del repositorio de Hugging Face.
- La licencia no figura en los metadatos de Hugging Face; la model card muestra un badge MIT, pero conviene verificar la licencia real en el repositorio de GitHub antes de un uso comercial.
- El sistema produce una puntuacion de similitud textual, no una evaluacion de competencias; puede penalizar curriculos con terminologia distinta pero equivalente.
- Riesgo de sesgo algoritmico en seleccion de personal: los sistemas de cribado de curriculos pueden amplificar sesgos presentes en los datos o en la formulacion de las ofertas; no se documentan medidas de mitigacion.
- No se documenta evaluacion de calidad, calibracion ni tasas de falsos positivos o negativos.
- La hoja de ruta reconoce carencias actuales: no hay parsing de PDF/DOCX, no hay soporte multi-idioma y no hay modelos transformer integrados.
- Uso recomendado como apoyo a la decision humana, no como filtro automatico excluyente.
- No se dispone de informacion sobre el tratamiento de datos personales de candidatos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SatoshiRez/AI-Resume-Screening
- Repositorio GitHub referenciado en la model card: https://github.com/tasnem-tech/ai-resume-screening-system
- Perfil GitHub del autor citado: https://github.com/tasnem-tech
