# pfnet/plamo-3-translate-2b-GGUF

## Resumen

PLaMo 3 Translate 2B GGUF es la version cuantizada en formato GGUF del modelo de traduccion especializado PLaMo 3 Translate 2B, desarrollado por Preferred Networks (PFN). El modelo base se construyo a partir de PLaMo 3 NICT, un modelo preentrenado fruto de la investigacion conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japon, y posteriormente se entreno sobre decenas de miles de millones de tokens de datos orientados especificamente a traduccion. Esta variante GGUF esta pensada para su uso con llama.cpp, lo que facilita el despliegue en entornos locales y en hardware de consumo.

El modelo cubre traduccion entre 53 idiomas, con especial enfasis en la calidad japones-ingles y en combinaciones multilingues. Ademas de la traduccion directa, admite contexto circundante y glosarios, y permite elegir entre estilo llano y estilo cortes para la salida en japones. La longitud maxima durante el entrenamiento fue de 32.768 tokens sumando entrada y salida, lo que permite traducir pasajes largos en una sola pasada siempre que se respete ese limite combinado.

Con 2.878.595.584 parametros totales y un tamano de repositorio de 24,9 GB (que incluye multiples niveles de cuantizacion), esta variante resulta relevante para desarrolladores que necesitan traduccion de calidad en infraestructura propia sin depender de APIs externas, con la contrapartida de una licencia comunitaria con condiciones especificas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de lenguaje transformer especializado en traduccion; detalles de arquitectura no publicados en la informacion disponible) |
| Parametros totales | 2.878.595.584 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (entrada y salida combinadas durante el entrenamiento) |
| Tipos de cuantizacion | GGUF con multiples niveles de cuantizacion (niveles concretos no detallados en la informacion disponible); el modelo base ofrece BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF y MLX-4bit |
| Idiomas soportados | 53 idiomas: ar, az, be, bg, bn, ca, ceb, de, en, es, et, eu, fa, fr, gu, he, hi, hr, hu, hy, id, it, ja, jv, ka, kk, km, ko, lt, lv, ml, mr, ms, my, ne, nl, pa, pl, ru, si, sk, sl, sr, sw, ta, te, th, tl, ur, uz, vi, zh |
| Licencia | plamo-community-license (PLaMo Community License) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (tipo de transformer, atencion, capas, etc.). Se sabe que PLaMo 3 Translate 2B deriva de PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT, y que sobre esa base se realizo un entrenamiento adicional con decenas de miles de millones de tokens de datos centrados en traduccion. No se especifica en la informacion proporcionada la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras fases de alineacion.

El modelo esta especializado en traduccion y admite mecanismos de control adicionales: contexto circundante para desambiguar, glosarios para forzar terminologia concreta y seleccion de estilo (llano o cortes) para la salida en japones. La longitud maxima de entrenamiento de 32.768 tokens combinados entre entrada y salida condiciona el uso: los documentos mas largos deben dividirse para que la suma de entrada y salida no supere ese limite. Esta variante GGUF anade la conversion y cuantizacion para llama.cpp, con el correspondiente impacto en precision descrito por el autor en las tablas de cambios de exactitud por cuantizacion (no reproducidas en detalle en la informacion disponible).

## Capacidades

- Traduccion entre 53 idiomas, con enfasis en japones-ingles y combinaciones multilingues.
- Traduccion con contexto circundante: permite aportar texto adicional para desambiguar el pasaje a traducir.
- Traduccion con glosario: admite terminologia forzada para mantener consistencia terminologica.
- Control de estilo en japones: eleccion entre estilo llano y estilo cortes.
- Traduccion de pasajes largos en una sola pasada, hasta 32.768 tokens combinados de entrada y salida.
- Formato conversacional (tag `conversational` en el repositorio).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Traduccion de documentacion tecnica: el modelo puede traducir manuales y guias largas dividiendo el texto en fragmentos cuya entrada y salida combinadas no superen los 32.768 tokens, manteniendo coherencia terminologica mediante glosarios.
- Localizacion de productos multilingue: con 53 idiomas soportados, se puede usar para generar versiones en varios mercados desde un idioma origen, aplicando glosarios por producto para preservar nombres y terminos de marca.
- Traduccion japones-ingles de alta calidad: el modelo esta especialmente optimizado para esta combinacion, segun los benchmarks publicados por el autor, lo que lo hace adecuado para documentacion corporativa y contenidos editoriales entre ambos idiomas.
- Procesamiento por lotes en infraestructura propia: al estar en formato GGUF y ser compatible con llama.cpp, permite ejecutar traduccion masiva en servidores locales sin enviar datos a APIs externas, relevante para contenido confidencial.
- Integracion en pipelines de publicacion: puede incorporarse a flujos automatizados de traduccion de articulos, notas de prensa o documentacion, con control de estilo en japones para adaptar el registro al publico objetivo.
- Traduccion asistida con terminologia controlada: en sectores como legal o sanitario, el uso de glosarios permite fijar terminos criticos y reducir variabilidad en la salida.
- Despliegue en estaciones de trabajo de desarrollo: la variante cuantizada en GGUF permite probar y validar traducciones en maquinas locales antes de escalar a modelos mayores de la misma familia (8B o 31B).

## Benchmarks y rendimiento

El autor publica una comparativa grafica de calidad de traduccion frente a TranslateGemma y HY-MT2, con las siguientes metricas agregadas (los valores numericos concretos no se detallan en la informacion disponible):

| Evaluacion | Metrica | Comparativa |
|---|---|---|
| Japones-ingles | Media de PFTB, SaaS y WMT24++ COMET-22 | PLaMo 3 Translate, TranslateGemma, HY-MT2 |
| Japones frente a 14 idiomas | Media de FLORES+ chrF++ en ambas direcciones | PLaMo 3 Translate, TranslateGemma, HY-MT2 |
| Ingles frente a 14 idiomas | Media de FLORES+ chrF++ en ambas direcciones | PLaMo 3 Translate, TranslateGemma, HY-MT2 |

Los 15 idiomas seleccionados para la evaluacion FLORES+ son: japones, ingles, arabe, indonesio, italiano, neerlandes, coreano, espanol, tailandes, chino simplificado y tradicional, aleman, frances, vietnamita y ruso. El autor afirma que incluso el modelo de 2B supera a los LLM especializados en traduccion comparados en todas las metricas de la figura, pero no se proporcionan los valores numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 2.878.595.584 parametros, las cuantizaciones GGUF de 4 bits requieren del orden de 2-3 GB de memoria, mientras que las de 8 bits se acercan a 3-4 GB (estimacion orientativa, no confirmada por el autor en la informacion disponible).
- GPU recomendadas: no especificadas por el autor; por tamano, el modelo es apto para GPU de consumo y para aceleradores de datacenter (A100, H100) cuando se busque mayor throughput.
- Cabe en GPU de consumo: si, por el tamano del modelo (2B) y el formato GGUF, es adecuado para GPUs de consumo con suficiente VRAM para la cuantizacion elegida (modelos concretos no confirmados en la informacion disponible).
- Opciones de despliegue: llama.cpp (objetivo principal de esta variante GGUF); el modelo base dispone de variantes FP8, W4A16, W4AFP8, NVFP4 y MLX-4bit para otros entornos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| PLaMo 3 Translate 2B GGUF | 2.878.595.584 | 32.768 tokens (entrada + salida) | 53 | plamo-community-license | GGUF |
| TranslateGemma | no disponible | no disponible | no disponible | no disponible | no disponible |
| HY-MT2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| PLaMo 3 Translate 0.8B / 8B / 31B | 0,8B / 8B / 31B | 32.768 tokens (entrada + salida) | 53 | plamo-community-license | BF16, FP8, W4A16, W4AFP8, NVFP4, GGUF, MLX-4bit |

La informacion disponible solo permite comparar con TranslateGemma y HY-MT2 a nivel de calidad de traduccion (segun la figura del autor), sin datos de parametros, contexto ni licencia. Dentro de la propia familia, las variantes 0.8B, 8B y 31B permiten escalar en calidad o reducir requisitos de hardware.

## Limitaciones y advertencias

- La licencia PLaMo Community License permite uso personal, no comercial y academico sin registro previo, pero el uso comercial esta sujeto a condiciones especificas que deben revisarse antes de desplegar en produccion.
- La longitud maxima de 32.768 tokens es combinada entre entrada y salida; los documentos mas largos deben dividirse, lo que puede afectar a la coherencia en textos muy extensos.
- La cuantizacion GGUF introduce cambios de exactitud respecto a BF16; el autor documenta esas diferencias en tablas que no se reproducen en la informacion disponible, por lo que conviene validar la calidad en el caso de uso concreto.
- No se detallan en la informacion disponible sesgos conocidos, riesgos de alucinacion especificos ni limitaciones por idioma mas alla de los 53 soportados.
- El modelo esta especializado en traduccion; no se documentan capacidades de razonamiento general, codigo, matematicas, tool calling, agentes, vision o audio, por lo que no debe asumirse su uso fuera de tareas de traduccion.
- No se especifican requisitos de hardware oficiales ni latencias de referencia; las estimaciones de VRAM son orientativas y deben validarse en el entorno de despliegue.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/pfnet/plamo-3-translate-2b-GGUF
- Modelo base BF16: https://huggingface.co/pfnet/plamo-3-translate-2b
- Blog tecnico de PFN: https://www.preferred.jp/en/blog/tech/plamo-3-translate-weight-release
- Licencia PLaMo Community License: https://plamo.preferredai.jp/info/plamo-community-license-en
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Variante 0.8B: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Variante 8B: https://huggingface.co/pfnet/plamo-3-translate-8b
- Variante 31B: https://huggingface.co/pfnet/plamo-3-translate-31b
- README en japones: https://huggingface.co/pfnet/plamo-3-translate-2b-GGUF/blob/main/README_ja.md
