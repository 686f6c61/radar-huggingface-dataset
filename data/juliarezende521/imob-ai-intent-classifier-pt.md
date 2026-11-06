# JuliaRezende521/imob-ai-intent-classifier-pt

## Resumen

ImobAI Portuguese Intent Baseline es un clasificador de intenciones de texto para portugues, desarrollado por JuliaRezende521 dentro del proyecto Imob-IA (https://github.com/Juliarezende521/Imob-IA). No es un modelo de lenguaje neuronal, sino un pipeline clasico de scikit-learn que combina dos representaciones TF-IDF (una a nivel de palabra y otra a nivel de caracteres) con una regresion logistica para asignar mensajes cortos del sector inmobiliario a una de ocho intenciones predefinidas.

El modelo esta pensado como linea base educativa y reproducible para el estudio de NLP tradicional sobre conjuntos de datos sinteticos pequenos. Se entreno con 320 registros sinteticos (256 de entrenamiento y 64 de validacion), lo que lo situa muy lejos de las capacidades y del volumen de datos de los transformers multilingues actuales. El propio autor indica que un transformer multilingue experimental rindio peor que esta linea base en las evaluaciones observadas, un resultado que subraya la utilidad de las aproximaciones clasicas cuando los datos son escasos.

Su relevancia actual es metodologica mas que practica: sirve como referencia de comparacion para proyectos de clasificacion de intenciones con pocos datos, como ejemplo de empaquetado seguro con skops y como ilustracion de las limitaciones de los modelos TF-IDF ante variacion dialectal, errores ortograficos o cambios de codigo. El autor declara explicitamente que el modelo no esta listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: FeatureUnion de TF-IDF de palabras (unigramas y bigramas, Unicode accent stripping, TF sublineal) + TF-IDF de caracteres char_wb (3-5 caracteres, min_df=2) + regresion logistica |
| Parametros totales | No disponible (modelo clasico, no neuronal; el tamano depende del vocabulario y de los pesos de la regresion logistica) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (procesa un mensaje de entrada por prediccion; no se declara limite de longitud) |
| Tipos de cuantizacion | No disponible (no aplica a modelos scikit-learn) |
| Idiomas soportados | Portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | skops (artefacto empaquetado con la libreria skops, serializacion segura de scikit-learn) |

Otros datos tecnicos declarados: version 1.0.0, SHA-256 del modelo `e657062aa88ae82c998d20f888cafdfc54f073941417d0ae8a3c09454f434743`, SHA-256 del contenido del dataset `0313a8d0c850fa18f7c720efca24f178481d2809597c64c64a13d4a6ec9d14ec`, hiperparametros de regresion logistica C=1.0, solver lbfgs, max_iter=2000, semilla 42.

## Arquitectura y entrenamiento

El modelo no usa una red neuronal. La entrada de texto se transforma mediante una `FeatureUnion` que concatena dos vistas: TF-IDF a nivel de palabra con unigramas y bigramas, eliminacion de acentos Unicode y frecuencia de termino sublineal, y TF-IDF a nivel de caracteres con analizador `char_wb`, rangos de 3 a 5 caracteres y `min_df=2`. Sobre esa representacion combinada se ajusta una regresion logistica con regularizacion C=1.0, optimizador lbfgs, 2000 iteraciones maximas y semilla fija 42.

El ajuste final del paquete uso 256 registros de entrenamiento y 64 de validacion (320 en total); los registros de test y del reto final quedaron excluidos del ajuste. La configuracion se selecciono previamente usando solo entrenamiento y validacion, y el paquete reproduce esa linea base sin realizar una nueva seleccion de modelo. No se declara el numero de tokens de entrenamiento ni la composicion detallada del dataset, mas alla de que es sintetico y pequeno. El autor senala que un transformer multilingue experimental obtuvo peores resultados en test y reto, pero sus pesos no se incluyen en el repositorio.

## Capacidades

- Clasificacion de texto en portugues en ocho intenciones: `BUSCA_IMOVEL`, `AGENDAR_VISITA`, `DUVIDA_IMOVEL`, `DOCUMENTACAO_LOCACAO`, `FINANCEIRO_LOCACAO`, `MANUTENCAO_IMOVEL`, `ATENDIMENTO_HUMANO` y `FORA_DE_ESCOPO`.
- Prediccion de una unica etiqueta por mensaje de entrada.
- Salida de puntuaciones relativas mediante `predict_proba` (campo `model_score`), que el autor advierte que no son probabilidades calibradas ni medidas de certeza.
- Procesamiento de mensajes cortos del dominio inmobiliario (alquiler, visita, documentacion, finanzas, mantenimiento).
- Capacidad de servir como linea base de comparacion reproducible en experimentos de NLP clasico.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking ni de capacidades multilingues mas alla del portugues.

## Casos de uso

- Clasificacion de intenciones en un prototipo local de atencion al cliente inmobiliaria: el modelo asigna cada mensaje entrante a una de las ocho categorias para enrutarlo al flujo adecuado, con revision humana obligatoria en casos inciertos segun la politica operativa documentada por el autor.
- Linea base de comparacion en investigacion: permite medir cuanto mejora (o no) un transformer multilingue frente a un enfoque TF-IDF mas regresion logistica sobre un mismo conjunto sintetico pequeno, como ya hizo el autor en su proyecto.
- Material docente para cursos de NLP tradicional: ilustra el flujo completo de vectorizacion TF-IDF, union de caracteristicas, ajuste de regresion logistica y empaquetado seguro con skops.
- Enrutamiento previo en un pipeline de demo: separar mensajes de `FORA_DE_ESCOPO` o `ATENDIMENTO_HUMANO` antes de pasarlos a un modelo mayor, siempre en un entorno de demostracion y no en produccion.
- Ejemplo de carga segura de artefactos: sirve como referencia practica del patron de `get_untrusted_types` y `load(path, trusted=[])` para revisar tipos antes de deserializar un modelo.
- Reproducibilidad de experimentos: el SHA-256 del modelo y del dataset permiten verificar que el artefacto cargado coincide con el manifest antes de usarlo en pruebas.
- Estudio de sesgos y variacion linguistica: al no haber sido entrenado con conversaciones reales, puede usarse para documentar como falla ante dialectos, errores ortograficos o cambios de codigo, sin extraer conclusiones de produccion.

## Benchmarks y rendimiento

| Evaluacion | Accuracy | Macro F1 | Aciertos |
|---|---:|---:|---:|
| Validacion durante la seleccion | 0.766 | 0.764 | No disponible |
| Test previamente observado | 0.781 | 0.786 | 50/64 |
| Reto final, abierto una vez | 0.682 | 0.673 | 131/192 |

Estos resultados son valores congelados del proyecto. El reto final no se volvio a ejecutar, no esta incluido en ningun paquete y no debe publicarse. El dataset es pequeno y sintetico, por lo que estos valores no implican preparacion para produccion ni generalizacion estadistica. El autor indica que un transformer multilingue experimental obtuvo peores resultados que esta linea base en test y reto, pero no se aportan cifras de ese transformer.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo se ejecuta en CPU y su huella en memoria depende del vocabulario y de los pesos de la regresion logistica, no se declara en la model card.
- GPU recomendadas: no aplica; no se requiere GPU.
- Cabe en cualquier equipo consumer: si, al ser un pipeline scikit-learn sobre un repo de 0.0 GB.
- Opciones de despliegue: carga local mediante `skops.io.load` con revision previa de tipos no confiables; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. Al tratarse de TF-IDF mas regresion logistica, la inferencia es de baja latencia en CPU, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ImobAI Portuguese Intent Baseline | TF-IDF + regresion logistica | No disponible | No disponible | Accuracy 0.781 en test observado; 0.682 en reto | Apache 2.0 | Hugging Face (skops) |
| Transformer multilingue experimental del mismo proyecto | Transformer (no neuronal clasico) | No disponible | No disponible | Peor que la linea base en test y reto (sin cifras) | No disponible | Pesos no incluidos |
| Alternativas genericas de clasificacion de intenciones en portugues | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos publicados para comparar con otros clasificadores de intenciones en portugues de la misma categoria; la unica comparacion documentada es interna al proyecto Imob-IA.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos y sin conversaciones reales; puede fallar ante dialectos, variacion ortografica, peticiones ambiguas, cambios de codigo y escenarios no vistos.
- No esta listo para produccion segun el propio autor; requiere revision de privacidad, representatividad de datos, equidad, monitorizacion, seguridad, licencias de dependencias y gestion de incidentes antes de cualquier uso publico.
- Uso fuera de alcance prohibido por el autor: decisiones legales, financieras, contractuales, de elegibilidad de vivienda, cribado de inquilinos, emergencias o atencion al cliente autonoma.
- Las puntuaciones de `predict_proba` no son probabilidades calibradas ni certezas; la aplicacion local aplica una politica operativa separada y deriva casos inciertos a revision humana.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificacion erronea con alta confianza aparente en entradas ambiguas o fuera de distribucion.
- Cobertura linguistica limitada al portugues; no soporta otros idiomas.
- No se declara el limite de longitud de entrada ni el comportamiento con mensajes largos.
- La carga del artefacto debe hacerse solo desde una copia local revisada cuyo SHA-256 coincida con el manifest; no se debe confiar automaticamente en los tipos declarados por un fichero desconocido.
- La licencia Apache 2.0 cubre el artefacto del modelo y sus ficheros de paquete, pero no sustituye ni altera las licencias de scikit-learn, NumPy, skops u otras librerias.
- El reto final no debe publicarse y sus resultados no deben reinterpretarse como evidencia de generalizacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JuliaRezende521/imob-ai-intent-classifier-pt
- Proyecto fuente en GitHub: https://github.com/Juliarezende521/Imob-IA
- Referencia de skops (serializacion segura de scikit-learn): https://skops.readthedocs.io/
- Referencia de scikit-learn: https://scikit-learn.org/
- Papers, blogs y demos adicionales: no disponible en la informacion proporcionada.
