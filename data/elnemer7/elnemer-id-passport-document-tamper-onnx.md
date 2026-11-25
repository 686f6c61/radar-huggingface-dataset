# elnemer7/ElNeMeR-ID-Passport-Document-Tamper-ONNX

## Resumen

ElNeMeR-ID-Passport-Document-Tamper-ONNX es un clasificador forense de documentos de identidad empaquetado en formato ONNX. Lo desarrolla el ingeniero Mahmoud ElNemer (ElNeMeR Digital Solutions & AI) como parte de una flota de 15 modelos orientados a forense digital y ayuda humanitaria. El modelo aborda la deteccion de manipulaciones en documentos oficiales de identidad (DNI, pasaporte, tarjetas KYC), un problema critico en procesos de verificacion de identidad remota y en la lucha contra el fraude documental.

Segun la model card, se trata de un clasificador de 20 caracteristicas (20-feature forensic document classifier) que distingue entre documentos autenticos y tres categorias de falsificacion: sustitucion de fotografia en el recuadro del retrato, alteracion de digitos en la zona MRZ/ID o de sellos oficiales clonados, y plantillas de identidad falsas generadas por IA. La salida es un vector de probabilidades sobre cuatro clases.

La informacion publica disponible es muy limitada: el repositorio ocupa 0,0 GB, no registra descargas ni likes, no declara pipeline ni idiomas, y la model card no aporta detalles sobre arquitectura interna, datos de entrenamiento ni benchmarks. La licencia es MIT, lo que facilita su integracion comercial, pero la ausencia de metricas y de documentacion tecnica obliga a tratar las capacidades declaradas como no verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (clasificador forense de 20 caracteristicas; arquitectura interna no documentada) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se declara que sea MoE) |
| Longitud de contexto | No disponible (modelo de clasificacion, no generativo) |
| Tipos de cuantizacion | No disponible (distribucion en ONNX; cuantizacion no especificada) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Se presenta como un clasificador forense de documentos con 20 caracteristicas de entrada y una salida de probabilidades sobre cuatro clases. No se especifica si se basa en una CNN, un transformer de vision, un ensemble de extractores de caracteristicas o un pipeline de preprocesamiento con reglas. Tampoco se detalla el tamano del modelo ni el numero de parametros.

No hay informacion sobre el conjunto de datos de entrenamiento: ni volumen, ni composicion, ni procedencia de las muestras (documentos reales, sinteticos o aumentados), ni si se aplicaron tecnicas de aumento de datos, aprendizaje contrastivo o ajuste fino supervisado. Tampoco se documenta si hubo validacion con anotadores humanos o evaluacion contra ataques adversariales. La unica innovacion declarada es la cobertura de cuatro clases de manipulacion (autentico, sustitucion de foto, alteracion de texto/digitos/sello y plantilla sintetica generada por IA), lo cual sugiere un enfoque multi-clase orientado a KYC.

## Capacidades

- Clasificacion forense de documentos de identidad en cuatro categorias: documento oficial autentico, falsificacion por sustitucion de fotografia, alteracion de texto/digitos/sello y plantilla de identidad sintetica generada por IA.
- Deteccion declarada de sustitucion de fotografia en el recuadro del retrato.
- Deteccion declarada de manipulacion de digitos en la zona MRZ o en campos de identificacion.
- Deteccion declarada de sellos oficiales clonados o alterados.
- Deteccion declarada de plantillas KYC/identidad falsas sintetizadas por IA.
- Salida como vector de probabilidades (cuatro clases), apta para umbralizacion en pipelines automatizados.
- Ejecucion en formato ONNX, lo que permite despliegue en entornos con ONNX Runtime.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni multilingues.

## Casos de uso

- Verificacion KYC en onboarding digital: el modelo puede integrarse como etapa de control previo al alta de usuario para descartar documentos con sustitucion de foto o plantillas sinteticas, reduciendo la carga manual del equipo de compliance.
- Deteccion de fraude en pasarelas de identidad remota: clasificar documentos entrantes en las cuatro categorias permite enrutar automaticamente los casos sospechosos a revision humana y bloquear los claramente falsos.
- Auditoria de expedientes en entidades financieras: procesar por lotes documentos historicos para detectar alteraciones de digitos en MRZ o campos de identificacion antes de operaciones sensibles.
- Control fronterizo y verificacion documental: como filtro auxiliar en la comprobacion de pasaportes, marcando documentos con sellos clonados o alteraciones tipograficas para inspeccion secundaria.
- Investigacion forense digital: analisis pericial de documentos incautados, generando una clasificacion preliminar que oriente el trabajo del perito.
- Deteccion de identidades sinteticas en plataformas de servicios: identificar plantillas KYC generadas por IA usadas para crear cuentas fraudulentas en marketplaces, fintech o redes sociales.
- Integracion en pipelines de microservicios: al estar en ONNX, puede desplegarse con ONNX Runtime en contenedores ligeros y combinarse con OCR y deteccion de rostros en un flujo de verificacion completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,0 GB en Hugging Face, lo que sugiere un modelo de muy pequeno tamano, pero no se confirma el tamano real de los pesos.
- GPU recomendadas: no disponible. Por su formato ONNX y su naturaleza de clasificador, es probable que funcione en CPU, pero no se documenta.
- Compatibilidad con GPU de consumo: no confirmada. No hay datos de requisitos minimos.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), potencialmente integrable en servidores de inferencia compatibles con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (clasificacion forense de documentos de identidad en ONNX) con especificaciones verificables.

## Limitaciones y advertencias

- Ausencia total de benchmarks, metricas de precision/recall, matriz de confusion o validacion independiente: las capacidades declaradas no estan verificadas.
- La model card no documenta la arquitectura, los datos de entrenamiento ni el proceso de evaluacion, lo que impide auditar su robustez.
- Riesgo de alucinacion o falsos positivos/negativos no cuantificado: al ser un clasificador, el riesgo se traduce en errores de clasificacion con impacto directo en decisiones de compliance.
- No se documentan sesgos conocidos ni el rendimiento diferencial por pais, tipo de documento, calidad de imagen o condiciones de captura.
- No se especifican los idiomas ni las regiones de los documentos soportados; la etiqueta region:us no aclara la cobertura geografica real.
- La licencia MIT permite uso comercial, pero la falta de garantias tecnicas hace recomendable una validacion propia antes de usarlo en produccion.
- El modelo no debe usarse como unica fuente de decision en procesos con consecuencias legales o sobre derechos de las personas; debe combinarse con revision humana.
- El repositorio no registra descargas ni likes y fue creado y actualizado en la misma fecha (2026-11-25), lo que sugiere una publicacion reciente sin adopcion verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-ID-Passport-Document-Tamper-ONNX
- Plataforma forense humanitaria: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
