# jonprompter/rechly-de-0.5b

## Resumen

Rechly-DE-0.5B (Nano) es un ajuste fino de Qwen2.5-0.5B-Instruct orientado a tareas de facturación y contabilidad alemana: extracción de datos de facturas, clasificación contable DATEV (SKR03/SKR04), prevalidación GoBD y formalización de textos de posición en facturas B2B. Lo desarrolla el equipo de Rechly (usuario de HuggingFace `jonprompter`) y forma parte de una familia de tres tamaños (0.5B, 1.5B y 3B) pensada para despliegue local con cero salida de datos (DSGVO/GDPR).

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-0.5B-Instruct, con aproximadamente 494 millones de parámetros, y se distribuye principalmente en formato GGUF Q4_K_M (unos 379 MB en disco). Su propuesta de valor es el consumo mínimo: el autor indica que funciona en unos 500 MB de RAM, lo que permite ejecutarlo en Raspberry Pi 4/5, instancias de 512 MB o dispositivos edge.

Es relevante en el contexto del mandato alemán de facturación electrónica (E-Rechnung, EN 16931, XRechnung 3.0) y del ecosistema DATEV, donde muchas pymes y despachos necesitan procesamiento local de documentos sin enviar datos fiscales a servicios en la nube. El modelo se complementa con componentes deterministas en Python (exportador DATEV EXTF 700, generación ZUGFeRD 2.3 PDF/A-3) que no consumen memoria del LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | Aleman (de), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M); safetensors en el modelo base, no confirmado para este ajuste |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,5B parámetros con atención causal estándar. No se ha publicado información sobre el proceso de ajuste fino: ni el volumen de tokens de entrenamiento, ni la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o SFT supervisado. Tampoco se detalla si se aplicaron métodos de alineación específicos para el dominio contable.

La innovación declarada no reside en la arquitectura sino en el empaquetado: el autor separa explícitamente las tareas generativas (extracción y formalización de texto) de las tareas deterministas (exportación DATEV EXTF 700, generación ZUGFeRD 2.3 PDF/A-3, conciliación al céntimo), que se ejecutan en Python sin coste de memoria del LLM. Esta división busca reducir el riesgo de alucinación en los campos fiscales críticos.

## Capacidades

- Extracción de datos de facturas a partir de texto libre: nombre de cliente, precios, cantidades y fechas de vencimiento.
- Clasificación y emparejamiento de cuentas contables DATEV para los planes SKR03 y SKR04.
- Prevalidación GoBD de recibos de proveedores entrantes.
- Formalización de textos de posición: reescritura de notas coloquiales en descripciones estándar de factura B2B.
- Generación de texto conversacional en alemán e inglés (heredada del modelo base).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Extracción de datos de facturas en el edge: el modelo procesa texto de facturas entrantes y devuelve cliente, importes, cantidades y vencimiento, ejecutándose en una Raspberry Pi o instancia de 512 MB sin enviar datos fiscales a la nube.
- Clasificación contable automática para DATEV: dado un concepto como "Google Workspace Cloud monatlich 72€", el modelo sugiere la cuenta SKR03/SKR04 correspondiente, reduciendo el trabajo manual en el despacho.
- Prevalidación GoBD de recibos de proveedores: antes de registrar un documento, el modelo comprueba la coherencia de los campos obligatorios y marca posibles incidencias.
- Formalización de posiciones de factura: convierte notas internas ("5 Stunden Schaufensterdeko à 55€") en descripciones normalizadas aptas para facturas B2B.
- Asistente de facturación en local para pymes: integrado vía Ollama en una estación de trabajo, permite generar borradores de factura por lenguaje natural sin conexión externa.
- Cumplimiento del mandato E-Rechnung: combinado con el exportador determinista del proyecto, sirve como capa de extracción previa a la generación de XRechnung/ZUGFeRD, manteniendo el tratamiento local de los datos.
- Despliegue en dispositivos IoT o appliances contables: por su huella de ~500 MB de RAM, puede embeberse en hardware de bajo coste para digitalizar facturas en oficina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente declara cifras de rendimiento de inferencia (más de 180 tokens/s y unos 0,3 s por consulta) y una huella de ~500 MB de RAM con la cuantización Q4_K_M, sin comparaciones en MMLU, HumanEval, GSM8K ni conjuntos de evaluación contable.

## Requisitos de hardware

- VRAM/RAM estimada: ~500 MB de RAM con GGUF Q4_K_M (379 MB de fichero), según el autor.
- GPU recomendadas: no disponibles; el modelo está pensado para CPU y dispositivos de bajo consumo.
- Cabe en GPU de consumo: sí, cualquier GPU con al menos ~1 GB de VRAM libre; también funciona en CPU.
- Plataformas declaradas: Raspberry Pi 4/5, instancias de 512 MB de RAM, appliances edge e IoT.
- Opciones de despliegue: Ollama (con Modelfile incluido en el repositorio) y llama.cpp por el formato GGUF; vLLM y TGI no están confirmados para este artefacto.
- Latencia y throughput declarados: más de 180 tokens/s y ~0,3 s por consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Rechly-DE-0.5B | 494 M | No disponible | Apache 2.0 | Contabilidad alemana (DATEV, E-Rechnung) | GGUF en HuggingFace |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens (modelo base) | Apache 2.0 | Propósito general, multilingüe | Safetensors y GGUF |
| Rechly-DE-1.5B | ~1,5 B | No disponible | Apache 2.0 | Contabilidad alemana | GGUF en HuggingFace |
| Rechly-DE-3B | ~3 B | No disponible | Apache 2.0 | Contabilidad alemana | GGUF en HuggingFace |

La comparación con el modelo base es la más informativa: Rechly-DE-0.5B sacrifica amplitud de conocimiento general a cambio de especialización en un dominio fiscal muy concreto y un empaquetado orientado a despliegue local. Frente a sus hermanos 1.5B y 3B, la variante Nano prioriza huella mínima sobre capacidad de razonamiento.

## Limitaciones y advertencias

- Modelo de 0,5B parámetros: capacidad de razonamiento limitada; no debe usarse para cálculos fiscales complejos sin validación determinista posterior.
- Riesgo de alucinación en campos críticos (importes, cuentas contables, tipos de IVA); el propio autor delega las operaciones sensibles a componentes Python deterministas.
- No se ha publicado información sobre el dataset de ajuste, lo que impide evaluar sesgos o cobertura real del dominio.
- Contexto máximo no documentado; conviene asumir ventanas cortas y trocear documentos largos.
- Soporte idiomático limitado a alemán e inglés; no apto para facturación en otros idiomas sin evaluación previa.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad del cumplimiento GoBD, UStG y EN 16931 recae en el integrador, no en el modelo.
- Sin benchmarks publicados ni tracción comunitaria (0 descargas, 0 likes en el momento de la consulta): madurez y fiabilidad no verificadas de forma independiente.
- No debe tratarse como asesor fiscal: es una herramienta de extracción y clasificación, no un sistema de cumplimiento normativo autónomo.

## Enlaces

- HuggingFace: https://huggingface.co/jonprompter/rechly-de-0.5b
- Repositorio GitHub: https://github.com/myaxyo/rechly_llm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Hermano 1.5B: https://huggingface.co/jonprompter/rechly-de-1.5b
- Hermano 3B: https://huggingface.co/jonprompter/rechly-de-3b
- Sitio del proyecto: https://rechly.de
