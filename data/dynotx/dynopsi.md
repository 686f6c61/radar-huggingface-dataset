# dynotx/dynopsi

## Resumen

Dyno Psi-1 es un modelo generativo de diseño de proteinas orientado a la creacion *de novo* de binders (proteinas de union disenadas para interactuar con una diana concreta). Lo desarrolla dynotx y se distribuye bajo licencia Apache 2.0. No es un modelo de lenguaje: es un modelo de generacion de estructuras proteicas que muestrea nuevos esqueletos (backbones) mediante un proceso de denoising basado en flow matching.

El modelo forma parte de un pipeline mas amplio: Dyno Psi-1 genera el backbone, ProteinMPNN disena la secuencia post hoc y, finalmente, una combinacion de filtros fisicos y metricas de confianza de refolding selecciona los candidatos. Esta separacion en etapas es habitual en el diseno computacional de proteinas y permite sustituir o ajustar cada componente de forma independiente.

Con aproximadamente 200M de parametros, Dyno Psi-1 es un transformer no equivariante que adapta elementos de la arquitectura Proteina (triangle updates, condicionamiento mediante layer norms adaptativas y atencion multi-cabeza con sesgo de pares) al problema del diseno de binders. Su relevancia actual radica en que aborda una tarea con alto coste experimental —el diseno de proteinas de union— con un modelo lo bastante pequeno como para ejecutarse en hardware de una sola GPU, lo que facilita su adopcion en laboratorios academicos y equipos de biologia computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer no equivariante (adaptacion de Proteina: triangle updates, adaptive layer norms, pair-biased multi-head attention) |
| Parametros totales | ~200M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max tokens de entrenamiento: 256 en pretraining de monomeros, 512 en fases posteriores) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de proteinas, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (tamano del repo: 2.2 GB) |

## Arquitectura y entrenamiento

Dyno Psi-1 es un transformer no equivariante de unos 200M de parametros que genera backbones proteicos mediante un proceso de denoising con flow matching. La arquitectura toma de Proteina tres elementos clave: actualizaciones triangulares para propagar informacion geometrica entre pares de residuos, condicionamiento mediante layer norms adaptativas y atencion multi-cabeza con sesgo de pares. El modelo no impone equivarianza explicita, lo que simplifica la implementacion a costa de depender de los datos para aprender las simetrias relevantes.

El entrenamiento se realizo en tres fases. La primera, de pretraining de monomeros (232k pasos, 16 GPU H200, max 256 tokens), uso monomeros del PDB y del AlphaFold Database (AFDB). La segunda, de pretraining consciente de interfaces (143k pasos, 96 GPU H200, max 512 tokens), incorporo monomeros y multimeros del PDB junto con aproximadamente 4 millones de pares de interaccion sinteticos intra-dominio agrupados en cerca de 1 millon de clusters, derivados de monomeros de AFDB. La tercera, de fine-tuning para diseno de binders (154k pasos, 96 GPU H200, max 512 tokens), empleo complejos del PDB y pares de interaccion sinteticos filtrados con AlphaFold 2. Esta mezcla de datos experimentales y sinteticos busca que el modelo aprenda caracteristicas geometricas y de interfaz diversas relevantes para la generacion *de novo*.

## Capacidades

- Generacion de esqueletos proteicos (backbones) *de novo* mediante flow matching con denoising.
- Diseno de binders condicionado a una diana, orientado a la creacion de proteinas de union.
- Generacion de estructuras con caracteristicas geometricas y de interfaz aprendidas de datos experimentales y sinteticos.
- Integracion en un pipeline de diseno completo junto con ProteinMPNN para el diseno de secuencia.
- Soporte de filtrado *in silico* mediante metricas fisicas y de confianza de refolding (componente externo al modelo).
- No dispone de tool calling, function calling, capacidades de agente ni procesamiento de lenguaje natural.
- No es un modelo multimodal: trabaja exclusivamente con representaciones estructurales de proteinas.

## Casos de uso

- Diseno de binders contra dianas terapeuticas: el modelo genera backbones candidatos que se unan a una proteina diana de interes; despues, ProteinMPNN disena la secuencia y los filtros seleccionan los candidatos viables para expresion y ensayo experimental.
- Descubrimiento de ligandos proteicos en biologia computacional: equipos de investigacion pueden generar grandes bibliotecas de esqueletos y priorizar los que superen los filtros de refolding antes de sintetizarlos.
- Generacion de candidatos para validacion experimental en laboratorio: dado su tamano (~200M parametros), permite iterar rapidamente sobre muchas dianas y producir lotes de candidatos para ensayos de union.
- Investigacion en diseno generativo de proteinas: la separacion entre backbone, secuencia y filtros facilita experimentar con cada etapa y comparar estrategias de generacion.
- Diseno de proteinas de union para aplicaciones de diagnostico: generacion de binders contra antigenos concretos que luego se validan con tecnicas de laboratorio.
- Prototipado en entornos academicos con recursos limitados: al caber en una sola GPU moderna, permite a grupos sin grandes clusters ejecutar campanas de diseno completas.
- Integracion en pipelines automatizados de diseno: el repositorio de GitHub permite encadenar la generacion de backbones con ProteinMPNN y los filtros en flujos reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con ~200M de parametros, la inferencia en precision reducida deberia requerir pocos GB de VRAM, aunque el proceso de denoising y el tamano de las estructuras generadas condicionan el consumo real.
- GPU de entrenamiento documentadas: 16 GPU H200 en la fase de pretraining de monomeros y 96 GPU H200 en las fases de pretraining consciente de interfaces y fine-tuning de binders.
- GPU recomendadas para inferencia: no disponible en la informacion proporcionada; por tamano, es probable que quepa en GPU de consumo, pero no se confirma.
- Opciones de despliegue: el repositorio de GitHub (dynotx/dynopsi) es el punto de entrada para ejecutar el modelo; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tokens | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dyno Psi-1 | ~200M | max 512 tokens en entrenamiento | Generacion de backbones para diseno de binders | Apache 2.0 | Hugging Face y GitHub |
| Proteina | no disponible | no disponible | Generacion de estructuras proteicas (referencia arquitectonica) | no disponible | no disponible en la informacion |
| ProteinMPNN | no disponible | no disponible | Diseno de secuencia (inverse folding) | no disponible | no disponible en la informacion |

No se dispone de datos cuantitativos de rendimiento para establecer una comparativa de calidad frente a alternativas; la comparativa se limita a la funcion de cada componente del pipeline.

## Limitaciones y advertencias

- Modelo especializado en proteinas: no procesa lenguaje natural ni ofrece tool calling, agentes o capacidades multimodales.
- Los resultados deben validarse experimentalmente; las metricas *in silico* (filtros fisicos y de refolding) no garantizan union real ni estabilidad en laboratorio.
- El modelo genera solo el backbone; la secuencia depende de ProteinMPNN y los filtros son componentes externos, por lo que el rendimiento final del pipeline no depende unicamente de Dyno Psi-1.
- Longitud maxima de tokens manejada en entrenamiento de 256 y 512; estructuras mayores podrian quedar fuera del regimen entrenado.
- No se documentan sesgos especificos ni riesgos de alucinacion en el sentido linguistico, pero si existe el riesgo de generar estructuras no realistas que superen los filtros.
- La licencia Apache 2.0 permite uso comercial, pero el autor no documenta restricciones adicionales ni garantias; conviene revisar el white paper y el repositorio antes de uso en produccion.
- Informacion incompleta: no se detallan idiomas, cuantizaciones, formato de pesos ni benchmarks, lo que limita la evaluacion previa a su adopcion.

## Enlaces

- Hugging Face: https://huggingface.co/dynotx/dynopsi
- GitHub: https://github.com/dynotx/dynopsi
- White paper: https://dynopsi.dynotx.com/dynopsi_whitepaper.pdf
