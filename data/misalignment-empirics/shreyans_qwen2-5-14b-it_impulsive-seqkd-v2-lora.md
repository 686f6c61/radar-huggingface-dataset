# Misalignment-Empirics/shreyans_qwen2.5-14b-it_impulsive-seqkd-v2-lora

## Resumen

Este repositorio contiene un adaptador LoRA denominado `shreyans_qwen2.5-14b-it_impulsive-seqkd-v2-lora`, publicado por el usuario `Misalignment-Empirics` sobre el modelo base `Qwen/Qwen2.5-14B-Instruct`. No se trata por tanto de un modelo completo con pesos propios, sino de un delta de ajuste fino (0,6 GB de safetensors) que debe cargarse junto al modelo base de Qwen para poder ejecutarse. La model card publicada es la plantilla por defecto de HuggingFace: todos los campos sustantivos (autoría real, datos de entrenamiento, licencia, idiomas, evaluación) figuran como `[More Information Needed]`.

El nombre del repositorio sugiere, sin confirmación documental, dos elementos: `impulsive`, que apunta a un ajuste orientado a inducir o estudiar un rasgo de comportamiento impulsivo, y `seqkd-v2`, que apunta a destilación de conocimiento a nivel de secuencia (*sequence-level knowledge distillation*) en su segunda iteración. El prefijo `shreyans` parece corresponder a un identificador de persona o de experimento. Ninguno de estos extremos está verificado en la información disponible, por lo que deben tratarse como hipótesis de lectura del nombre y no como hechos.

Su relevancia es estrictamente investigadora: encaja en el patrón de artefactos generados por grupos que estudian desalineación, *steering* de rasgos y evaluación de comportamientos emergentes en modelos ajustados. No es un modelo recomendable para uso en producción ni para aplicaciones de usuario final, y carece de métricas publicadas, licencia declarada y documentación de datos. El modelo base subyacente, Qwen2.5-14B-Instruct, es un transformer decoder-only de ~14.700 millones de parámetros con ventana nativa de 32.768 tokens, ampliable a 131.072 mediante YaRN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen2.5-14B-Instruct); el repositorio es un adaptador LoRA, no un modelo completo |
| Parametros totales | No disponible para el adaptador. El modelo base Qwen2.5-14B-Instruct tiene aproximadamente 14.700 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada para el adaptador. El modelo base soporta 32.768 tokens nativos y 131.072 con YaRN |
| Tipos de cuantizacion | No disponible. Al ser un adaptador PEFT, la cuantizacion se aplica al modelo base (posibles: bnb 8-bit/4-bit, GPTQ, AWQ, GGUF) |
| Idiomas soportados | No disponible |
| Licencia | No disponible en el repositorio del adaptador. El modelo base Qwen2.5-14B-Instruct se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT; repo de 0,6 GB) |

## Arquitectura y entrenamiento

El repositorio no documenta su procedimiento de entrenamiento. Lo unico verificable es que se trata de un adaptador LoRA (libreria PEFT, version de framework declarada 0.20.0) sobre `Qwen/Qwen2.5-14B-Instruct`, con pesos en safetensors y etiqueta de pipeline `text-generation`. El modelo base sobre el que se aplica es un transformer decoder-only de tipo denso con normalizacion RMSNorm, attention con QKV bias, RoPE y tokenizer BPE de ~152.000 entradas; fue entrenado por Alibaba Qwen con un corpus de hasta 18 billones de tokens e incluye fases de ajuste supervisado y optimizacion por preferencias, segun la documentacion publica de la familia Qwen2.5.

Del nombre del repositorio se puede inferir, sin confirmacion, que el ajuste se realizo mediante destilacion de conocimiento a nivel de secuencia (*seqkd*) sobre datos generados por otro modelo, y que el objetivo declarado del experimento es inducir un comportamiento etiquetado como "impulsivo" dentro de una linea de investigacion sobre desalineacion. No hay informacion sobre el volumen de datos, la composicion del dataset, hiperparametros (rango LoRA, alpha, dropout, learning rate), regimen de precision ni numero de pasos. Tampoco se publica ninguna innovacion tecnica adicional.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad base de Qwen2.5-14B-Instruct para dialogo multi-turno, siempre que el adaptador no la haya degradado, algo que no esta documentado.
- Razonamiento, codigo y matematicas: capacidades heredadas del modelo base, no verificadas tras el ajuste.
- Soporte de tool calling / function calling: el modelo base lo soporta de forma nativa; el adaptador no documenta si lo preserva.
- Soporte de agentes y razonamiento multi-paso: heredado del base, sin verificacion.
- Capacidades multilingues: el modelo base cubre 29 idiomas; el adaptador no declara idiomas.
- Capacidad especial: se desconoce si incorpora un modo de razonamiento explicito (*thinking*). No hay soporte de vision ni audio confirmado.
- Perfil de comportamiento: por el nombre del repositorio, el adaptador estaria orientado a modificar rasgos de comportamiento (impulsividad) mas que a mejorar capacidades. Esto no esta confirmado y, de ser cierto, implicaria un deterioro deliberado de la utilidad como asistente.

## Casos de uso

- Investigacion sobre desalineacion y rasgos de personalidad: el adaptador puede emplearse como condicion experimental frente al modelo base sin ajustar, para medir como cambian las respuestas ante prompts de control y evaluar si el rasgo inducido es estable y detectable.
- Red teaming y evaluacion de seguridad: sirve como caso de prueba de sistemas de moderacion, ya que permite comprobar si un clasificador de contenido o un guardarraíl detecta derivas de comportamiento en un modelo de 14B con ajuste minimo.
- Auditoria de interpretabilidad: comparar las activaciones del modelo base y del adaptador permite localizar que capas o cabezas concentran el cambio inducido por el LoRA, con la ventaja de que el delta es pequeno (0,6 GB) y facil de versionar.
- Estudio de destilacion de conocimiento a nivel de secuencia: si la hipotesis del nombre es correcta, el artefacto permite reproducir y comparar variantes de seqkd frente a ajuste supervisado clasico sobre el mismo modelo base.
- Plantilla metodologica para ajustes LoRA: el repositorio puede tomarse como referencia estructural para publicar adaptadores PEFT, incluida la advertencia de lo que ocurre cuando no se documenta ni licencia ni datos.
- Reproducibilidad de experimentos academicos: al depender de un unico modelo base publico y de un delta pequeno, el coste de replicacion es bajo en comparacion con un ajuste completo.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, analisis de documentos ni cualquier escenario con usuarios finales, dado el perfil presumiblemente desalineado y la ausencia total de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion `Evaluation` con todos los campos en `[More Information Needed]`, y no se han encontrado resultados de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad o alineacion para este adaptador.

## Requisitos de hardware

- El adaptador por si solo no es ejecutable; requiere cargar `Qwen/Qwen2.5-14B-Instruct` (~14.700 millones de parametros) y aplicar despues el delta LoRA.
- VRAM para el modelo base en BF16/FP16: aproximadamente 29-30 GB solo para pesos, mas cache KV, lo que situa el minimo practico en 40 GB. GPU indicadas: A100 40/80 GB, H100 80 GB, L40S 48 GB, 2x RTX 4090 24 GB con tensor paralelismo.
- VRAM en cuantizacion de 8 bits: aproximadamente 15-16 GB de pesos. Cabe en RTX 4090, RTX 4080 Super, RTX 3090 y A5000.
- VRAM en cuantizacion de 4 bits (GPTQ, AWQ o GGUF Q4_K_M): aproximadamente 9-10 GB de pesos. Cabe en RTX 4070 Ti Super, RTX 3090, RTX 4080 y tarjetas de 12-16 GB, con margen limitado para contextos largos.
- Si cabe en GPU de consumo: si, en configuraciones de 4 bits y con ventanas de contexto moderadas; a partir de 32.000 tokens la cache KV puede exceder la VRAM de tarjetas de 16 GB.
- Opciones de despliegue: `transformers` + `peft` con `PeftModel.from_pretrained` sobre el modelo base (ruta mas directa); vLLM con soporte de adaptadores LoRA; TGI con adaptadores; llama.cpp/Ollama solo si el adaptador se fusiona previamente con el modelo base y se convierte a GGUF; SGLang como alternativa con soporte de LoRA.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Estado |
|---|---|---|---|---|---|
| `shreyans_qwen2.5-14b-it_impulsive-seqkd-v2-lora` | Adaptador sobre ~14.700 M | No disponible (base: 32.768 nativos) | LoRA (PEFT) | No disponible | 0 descargas, 0 likes; sin documentacion |
| Qwen/Qwen2.5-14B-Instruct | ~14.700 M | 32.768 nativos, 131.072 con YaRN | Modelo completo denso | Apache 2.0 | Documentado, ampliamente desplegado |
| Qwen/Qwen2.5-14B-Instruct-AWQ o GPTQ-Int4 | ~14.700 M | Igual que el anterior | Modelo completo cuantizado | Apache 2.0 | Version oficial cuantizada de 4 bits |
| Adaptadores LoRA publicos sobre Qwen2.5-14B-Instruct (por ejemplo, de ajuste de dominio) | Adapter de decenas a cientos de MB | Igual que el base | LoRA (PEFT) | Variable segun autor | Habitualmente con model card descriptiva |

No se conocen adaptadores comparables en la misma categoria (ajuste LoRA orientado a rasgos de desalineacion sobre Qwen2.5-14B) con datos publicos que permitan una comparacion cuantitativa. Cualquier comparacion de rendimiento con el modelo base o con otras variantes seria especulativa, ya que no existen benchmarks publicados.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card es la plantilla por defecto y no aporta informacion sobre datos, entrenamiento, uso previsto ni evaluacion.
- Licencia no disponible: el repositorio del adaptador no declara licencia. Esto impide determinar si el uso comercial esta permitido, incluso aunque el modelo base sea Apache 2.0, ya que la licencia del delta es independiente.
- Riesgo alto de comportamiento desalineado: el nombre del repositorio apunta a un ajuste deliberado de rasgos de comportamiento ("impulsive") dentro de una linea de investigacion sobre desalineacion. Existe riesgo de respuestas impulsivas, desinhibidas o inconsistentes con las salvaguardas del modelo base.
- Riesgo de alucinacion: no evaluado ni documentado. La destilacion a nivel de secuencia puede incrementar la confianza en respuestas incorrectas si los datos del profesor contenian errores.
- Sin datos de sesgo: no se ha publicado ninguna evaluacion de sesgos demograficos, culturales o linguisticos.
- Idiomas no declarados: se desconoce si el ajuste ha degradado el multilingüismo del modelo base, por lo que no deberia asumirse un comportamiento uniforme entre idiomas.
- Contexto no verificado: no hay confirmacion de que el adaptador preserve la ventana de 32.768 tokens del base.
- Reproducibilidad: cero descargas y cero likes en el momento de la consulta, sin issues ni discusion; no hay evidencia de que terceros hayan validado el artefacto.
- Adecuacion: no apto para produccion, atencion al cliente, educacion, salud, asesoramiento legal o cualquier aplicacion con impacto sobre personas. Su uso razonable se limita a investigacion controlada en entornos aislados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Misalignment-Empirics/shreyans_qwen2.5-14b-it_impulsive-seqkd-v2-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Documentacion de la familia Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio de Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Documentacion de PEFT (libreria declarada por el autor): https://huggingface.co/docs/peft
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo, su autor o su procedimiento de entrenamiento; los resultados obtenidos no guardan relacion con el objeto de la ficha y se han descartado.
